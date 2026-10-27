import path from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Plugin, ResolvedConfig } from 'vite'
import { getPosts, publishedPosts, type BuiltPost } from './posts'

interface SiteInfo {
  url: string
  title: string
  description: string
}

interface PageSpec {
  /** 相对输出目录的文件路径(不含 .html),如 posts/hello;空串表示首页 index.html */
  file: string
  /** 页面路由(不含 base),如 /posts/hello */
  route: string
  title?: string
  description?: string
  type?: 'website' | 'article'
  publishedTime?: string
  /** 放进 <noscript> 的内容 */
  body: string
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Windows/Linux 都能落盘的文件名;否则跳过该页(仍可经 SPA 回退访问) */
function isSafeSegment(s: string): boolean {
  return s.length > 0 && !/[\\/:*?"<>|]/.test(s) && !s.startsWith('.')
}

function setMeta(html: string, attr: 'name' | 'property', key: string, value: string): string {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  return html.replace(re, `$1${escapeHtml(value)}$2`)
}

/**
 * 按路由预生成静态 HTML:以构建产物 index.html 为模板,替换 title / description / OG / canonical,
 * 并在 <noscript> 中放入正文或文章列表,供爬虫与不执行 JS 的阅读器使用。
 * 产物为 posts/<slug>.html 等扁平文件:GitHub Pages 与 Caddy(try_files {path}.html)都能按无扩展名路径直接命中。
 * 不做 SSR 注水:页面加载后仍由 SPA 接管渲染。
 */
export function staticPagesPlugin(site: SiteInfo): Plugin {
  let config: ResolvedConfig

  return {
    name: 'static-pages',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir)
      const templatePath = path.join(outDir, 'index.html')
      if (!existsSync(templatePath)) return
      const template = readFileSync(templatePath, 'utf-8')
      const base = config.base
      const posts = publishedPosts(getPosts())
      const pageTitle = (t?: string) => (t ? `${t} · ${site.title}` : `${site.title} · ${site.description}`)

      const postLinks = (list: BuiltPost[]) =>
        `<ul>${list
          .map(
            (p) =>
              `<li><a href="${base}posts/${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a> <time>${p.createdAt.slice(0, 10)}</time><p>${escapeHtml(p.excerpt)}</p></li>`,
          )
          .join('')}</ul>`

      const pages: PageSpec[] = [
        { file: '', route: '/', body: `<h1>${escapeHtml(site.title)}</h1>${postLinks(posts)}` },
        { file: 'archives', route: '/archives', title: '归档', body: `<h1>归档</h1>${postLinks(posts)}` },
        { file: 'about', route: '/about', title: '关于', body: `<h1>关于</h1>` },
      ]

      const tags = Array.from(new Set(posts.flatMap((p) => p.tags)))
      pages.push({
        file: 'tags',
        route: '/tags',
        title: '标签',
        body: `<h1>标签</h1><ul>${tags
          .map((t) => `<li><a href="${base}tags/${encodeURIComponent(t)}">${escapeHtml(t)}</a></li>`)
          .join('')}</ul>`,
      })
      for (const tag of tags) {
        if (!isSafeSegment(tag)) continue
        pages.push({
          file: `tags/${tag}`,
          route: `/tags/${encodeURIComponent(tag)}`,
          title: `#${tag}`,
          body: `<h1>#${escapeHtml(tag)}</h1>${postLinks(posts.filter((p) => p.tags.includes(tag)))}`,
        })
      }

      const seriesNames = Array.from(new Set(posts.map((p) => p.series).filter((s): s is string => !!s)))
      for (const name of seriesNames) {
        if (!isSafeSegment(name)) continue
        const list = posts.filter((p) => p.series === name).reverse()
        pages.push({
          file: `series/${name}`,
          route: `/series/${encodeURIComponent(name)}`,
          title: `系列:${name}`,
          body: `<h1>${escapeHtml(name)}</h1>${postLinks(list)}`,
        })
      }

      for (const post of posts) {
        if (!isSafeSegment(post.slug)) continue
        pages.push({
          file: `posts/${post.slug}`,
          route: `/posts/${encodeURIComponent(post.slug)}`,
          title: post.title,
          description: post.excerpt || undefined,
          type: 'article',
          publishedTime: post.createdAt,
          body: `<article><h1>${escapeHtml(post.title)}</h1><time>${post.createdAt.slice(0, 10)}</time>${post.html}</article>`,
        })
      }

      for (const page of pages) {
        const title = pageTitle(page.title)
        const description = page.description ?? site.description
        const url = `${site.url}${page.route === '/' ? '/' : page.route}`

        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title ? title : site.title)}</title>`)
        html = setMeta(html, 'name', 'description', description)
        html = setMeta(html, 'property', 'og:type', page.type ?? 'website')
        html = setMeta(html, 'property', 'og:title', title)
        html = setMeta(html, 'property', 'og:description', description)
        html = setMeta(html, 'property', 'og:url', url)
        html = setMeta(html, 'name', 'twitter:title', title)
        html = setMeta(html, 'name', 'twitter:description', description)

        const extraHead = [
          `<link rel="canonical" href="${escapeHtml(url)}">`,
          page.publishedTime ? `<meta property="article:published_time" content="${page.publishedTime}">` : '',
        ]
          .filter(Boolean)
          .join('\n')
        html = html.replace('</head>', `${extraHead}\n</head>`)
        html = html.replace('<div id="root"></div>', `<div id="root"></div>\n<noscript>${page.body}</noscript>`)

        const target = path.join(outDir, page.file ? `${page.file}.html` : 'index.html')
        mkdirSync(path.dirname(target), { recursive: true })
        writeFileSync(target, html)
      }

      // GitHub Pages 深链接回退:404.html 需保留的路径段数 = base 的段数(/manuscript-archive/ → 1)
      const notFoundPath = path.join(outDir, '404.html')
      if (existsSync(notFoundPath)) {
        const keep = base.split('/').filter(Boolean).length
        writeFileSync(
          notFoundPath,
          readFileSync(notFoundPath, 'utf-8').replace(/var pathSegmentsToKeep = \d+;/, `var pathSegmentsToKeep = ${keep};`),
        )
      }
    },
  }
}
