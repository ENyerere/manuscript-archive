import path from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { parseFrontMatter } from '../src/lib/frontMatter'
import type { TocItem } from '../src/lib/toc'
import { renderMarkdown } from './markdown'

export const POSTS_DIR = path.resolve(__dirname, '../src/content/posts')

export interface BuiltPost {
  /** 文件名(不含 .md),版本历史按它对齐 */
  file: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
  createdAt: string
  updatedAt: string
  /** createdAt 是否为合法日期(RSS / sitemap 只收录合法日期的文章) */
  hasDate: boolean
  published: boolean
  series?: string
  wordCount: number
  html: string
  headings: TocItem[]
  text: string
}

const EPOCH = '1970-01-01T00:00:00.000Z'

function toIso(dateStr: string): string | null {
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** 读取并渲染全部文章;缺 title 的文件跳过 */
export function loadPosts(): BuiltPost[] {
  const posts: BuiltPost[] = []
  for (const name of readdirSync(POSTS_DIR)) {
    if (!name.endsWith('.md')) continue
    const file = name.replace(/\.md$/, '')
    const { data, body } = parseFrontMatter(readFileSync(path.join(POSTS_DIR, name), 'utf-8'))
    const title = String(data.title || '')
    if (!title) {
      console.warn(`[content] ${name}: 缺少 title,已跳过`)
      continue
    }
    const content = body.trim()
    const created = toIso(String(data.createdAt || ''))
    const createdAt = created ?? EPOCH
    posts.push({
      file,
      slug: String(data.slug || file),
      title,
      excerpt: String(data.excerpt || ''),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      createdAt,
      updatedAt: toIso(String(data.updatedAt || '')) ?? createdAt,
      hasDate: created !== null,
      published: data.published !== false,
      series: data.series ? String(data.series) : undefined,
      wordCount: content.replace(/\s+/g, '').length,
      ...renderMarkdown(content),
    })
  }
  return posts
}

/** 已发布且日期合法的文章,按 createdAt 倒序 */
export function publishedPosts(posts: BuiltPost[]): BuiltPost[] {
  return posts
    .filter((p) => p.published && p.hasDate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

let cache: BuiltPost[] | null = null
/** 同一次构建内共享渲染结果;开发模式下文章变更时清空 */
export function getPosts(): BuiltPost[] {
  cache ??= loadPosts()
  return cache
}

const POSTS_ID = 'virtual:posts'
const BODY_PREFIX = 'virtual:post-body/'
const SEARCH_ID = 'virtual:post-search'

/**
 * 文章内容管线:构建期把 Markdown 渲染成 HTML,经虚拟模块注入前端。
 * - virtual:posts:全部文章元数据 + 每篇正文的按需加载函数(进主包,只含元数据)
 * - virtual:post-body/<file>:单篇正文 HTML 与目录(独立 chunk,进入文章页时加载)
 * - virtual:post-search:检索用纯文本(独立 chunk,首次检索时加载)
 */
export function postsPlugin(): Plugin {
  return {
    name: 'posts',
    configureServer(s) {
      const onChange = (file: string) => {
        if (!path.resolve(file).startsWith(POSTS_DIR)) return
        cache = null
        for (const id of s.moduleGraph.idToModuleMap.keys()) {
          if (id.startsWith('\0virtual:post')) {
            const mod = s.moduleGraph.getModuleById(id)
            if (mod) s.moduleGraph.invalidateModule(mod)
          }
        }
        s.ws.send({ type: 'full-reload' })
      }
      s.watcher.on('add', onChange)
      s.watcher.on('unlink', onChange)
      s.watcher.on('change', onChange)
    },
    resolveId(id) {
      if (id === POSTS_ID || id === SEARCH_ID || id.startsWith(BODY_PREFIX)) return '\0' + id
    },
    load(id) {
      if (!id.startsWith('\0virtual:post')) return null
      const key = id.slice(1)
      const posts = getPosts()

      if (key === POSTS_ID) {
        const meta = posts.map(({ html: _html, headings: _headings, text: _text, ...rest }) => rest)
        // 未发布文章不生成正文 chunk,草稿内容不会进入产物
        const loaders = posts
          .filter((p) => p.published)
          .map((p) => `  ${JSON.stringify(p.slug)}: () => import(${JSON.stringify(BODY_PREFIX + p.file)}),`)
          .join('\n')
        return `export const posts = ${JSON.stringify(meta)}\nexport const bodies = {\n${loaders}\n}\n`
      }

      if (key === SEARCH_ID) {
        const index = Object.fromEntries(
          posts.filter((p) => p.published).map((p) => [p.slug, p.text.toLowerCase()]),
        )
        return `export default ${JSON.stringify(index)}`
      }

      const file = key.slice(BODY_PREFIX.length)
      const post = posts.find((p) => p.file === file)
      if (!post) return null
      return `export default ${JSON.stringify({ html: post.html, headings: post.headings })}`
    },
  }
}
