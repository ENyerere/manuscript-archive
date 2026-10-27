import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { projectConfigs, type Project } from './src/data/projects'
import { postsPlugin, getPosts, publishedPosts, POSTS_DIR } from './build/posts'
import { staticPagesPlugin } from './build/staticPages'

/**
 * F4 版本历史:构建期为每篇文章取 git 短 hash 与修订次数,
 * 经虚拟模块 virtual:post-revisions 注入前端。
 * 降级策略:git 或远端不可用 → repoUrl 为 null(页面不显示 rev 行);
 * 文件未提交 → 该文无记录(页面显示 draft)。
 */
const VIRTUAL_ID = 'virtual:post-revisions'
const RESOLVED_ID = '\0' + VIRTUAL_ID

function git(args: string): string {
  return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
}

/** https://github.com/o/r.git 或 git@github.com:o/r.git → https://github.com/o/r */
function normalizeRepoUrl(remote: string): string | null {
  if (/^https?:\/\/.+/.test(remote)) return remote.replace(/\.git$/, '')
  const ssh = /^git@([^:]+):(.+)$/.exec(remote)
  if (ssh) return `https://${ssh[1]}/${ssh[2].replace(/\.git$/, '')}`
  return null
}

function postRevisionsPlugin(): Plugin {
  return {
    name: 'post-revisions',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return null

      let repoUrl: string | null = null
      let branch = 'main'
      const revisions: Record<string, { hash: string; count: number }> = {}

      try {
        repoUrl = normalizeRepoUrl(git('config --get remote.origin.url'))
        branch = git('rev-parse --abbrev-ref HEAD') || 'main'
        for (const file of readdirSync(POSTS_DIR)) {
          if (!file.endsWith('.md')) continue
          const rel = `src/content/posts/${file}`
          try {
            const hash = git(`log -1 --format=%h -- "${rel}"`)
            if (!hash) continue // 未提交:无版本记录
            const count = Number(git(`rev-list --count HEAD -- "${rel}"`)) || 1
            revisions[file.replace(/\.md$/, '')] = { hash, count }
          } catch {
            // 单文件查询失败不影响整体
          }
        }
      } catch {
        repoUrl = null
      }

      return `export default ${JSON.stringify({ repoUrl, branch, revisions })}`
    },
  }
}

// https://vitejs.dev/config/
/**
 * P0-2 RSS 订阅:构建期从 src/content/posts/*.md 生成 RSS 2.0 feed。
 * 经 emitFile 写入 dist/feed.xml;SITE_URL 可用环境变量覆盖(本地构建默认 Pages 地址)。
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://enyerere.github.io/manuscript-archive').replace(/\/$/, '')
const SITE_TITLE = '小峄热心市民'
const SITE_DESC = '手稿档案 · 个人博客'
/** 搜索引擎/社交分享用的完整描述 */
const SEO_DESC = '小峄热心市民的个人博客:手稿档案风格的技术笔记、项目总结与个人随笔,支持标签检索、系列连载与 RSS 订阅。'

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RSS 全文:根相对链接改写为绝对地址(阅读器里没有站点上下文);]]> 拆开避免提前闭合 CDATA */
function feedHtml(html: string): string {
  const absolute = html.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE_URL}/`)
  return `<![CDATA[${absolute.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function rssFeedPlugin(): Plugin {
  return {
    name: 'rss-feed',
    generateBundle() {
      const items = publishedPosts(getPosts()).slice(0, 20)

      const itemXml = items
        .map((p) => {
          const link = `${SITE_URL}/posts/${p.slug}`
          const cats = p.tags.map((t) => `      <category>${xmlEscape(t)}</category>`).join('\n')
          return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description>${xmlEscape(p.excerpt)}</description>
      <content:encoded>${feedHtml(p.html)}</content:encoded>${cats ? `\n${cats}` : ''}
    </item>`
        })
        .join('\n')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <description>${xmlEscape(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>
`
      this.emitFile({ type: 'asset', fileName: 'feed.xml', source: xml })
    },
  }
}

/**
 * 关于页 GitHub 数据:构建期拉取仓库活数据,经虚拟模块注入前端。
 * - virtual:github-projects:按 projectConfigs 策展名单组装项目展示
 * - virtual:github-languages:聚合全部非 fork 仓库的语言字节数,输出占比 Top 6 + 其他
 * 降级策略:API 不可用(离线/限流)→ 项目仅配置信息、语言为空数组(前端回退手写清单)。
 */
const GITHUB_PROJECTS_ID = 'virtual:github-projects'
const GITHUB_LANGUAGES_ID = 'virtual:github-languages'
const RESOLVED_PROJECTS_ID = '\0' + GITHUB_PROJECTS_ID
const RESOLVED_LANGUAGES_ID = '\0' + GITHUB_LANGUAGES_ID

interface GhRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
}

function githubDataPlugin(): Plugin {
  // 同一次构建内共享仓库列表,避免重复请求
  let reposPromise: Promise<GhRepo[]> | null = null

  async function fetchRepos(): Promise<GhRepo[]> {
    let owner = 'ENyerere'
    try {
      const remote = git('config --get remote.origin.url')
      owner = /github\.com[:/]([^/]+)/.exec(remote)?.[1] ?? owner
    } catch {
      // 保留默认
    }
    try {
      const res = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100`, {
        headers: { 'User-Agent': 'easy-web-build', Accept: 'application/vnd.github+json' },
      })
      if (res.ok) return (await res.json()) as GhRepo[]
    } catch {
      // 离线/限流:返回空,调用方自动降级
    }
    return []
  }

  return {
    name: 'github-data',
    resolveId(id) {
      if (id === GITHUB_PROJECTS_ID) return RESOLVED_PROJECTS_ID
      if (id === GITHUB_LANGUAGES_ID) return RESOLVED_LANGUAGES_ID
    },
    async load(id) {
      if (id !== RESOLVED_PROJECTS_ID && id !== RESOLVED_LANGUAGES_ID) return null
      reposPromise ??= fetchRepos()
      const repos = await reposPromise
      const live = new Map(repos.map((r) => [r.name, r]))

      if (id === RESOLVED_PROJECTS_ID) {
        const owner = repos[0]?.html_url.match(/github\.com\/([^/]+)/)?.[1] ?? 'ENyerere'
        const projects: Project[] = projectConfigs.map((c) => {
          const r = live.get(c.repo)
          return {
            repo: c.repo,
            title: c.title ?? c.repo,
            description: c.description ?? r?.description ?? '',
            url: r?.html_url ?? `https://github.com/${owner}/${c.repo}`,
            language: r?.language ?? null,
            stars: r?.stargazers_count ?? 0,
            pushedAt: r?.pushed_at ?? '',
          }
        })
        return `export default ${JSON.stringify(projects)}`
      }

      // 语言占比:逐仓库拉 linguist 字节数聚合,fork 不计(避免算上别人的代码)
      const ownRepos = repos.filter((r) => !r.fork).slice(0, 30)
      const totals = new Map<string, number>()
      await Promise.all(
        ownRepos.map(async (r) => {
          try {
            const res = await fetch(
              `https://api.github.com/repos/${r.html_url.replace('https://github.com/', '')}/languages`,
              { headers: { 'User-Agent': 'easy-web-build', Accept: 'application/vnd.github+json' } },
            )
            if (!res.ok) return
            const langs = (await res.json()) as Record<string, number>
            for (const [lang, bytes] of Object.entries(langs)) {
              totals.set(lang, (totals.get(lang) ?? 0) + bytes)
            }
          } catch {
            // 单仓库失败不影响整体
          }
        }),
      )
      const totalBytes = Array.from(totals.values()).reduce((a, b) => a + b, 0)
      const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
      const top = sorted.slice(0, 6)
      const restBytes = sorted.slice(6).reduce((sum, [, b]) => sum + b, 0)
      const languages = top.map(([name, bytes]) => ({
        name,
        percent: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      }))
      if (restBytes > 0 && totalBytes > 0) {
        const percent = Math.round((restBytes / totalBytes) * 100)
        if (percent > 0) languages.push({ name: '其他', percent })
      }
      return `export default ${JSON.stringify(languages)}`
    },
  }
}

/**
 * SEO:构建期生成 sitemap.xml,并向 index.html 注入站点级 OG/Twitter meta。
 * 文章/标签等页面的 meta 由 staticPagesPlugin 以此为模板逐路由替换。
 */
function seoPlugin(): Plugin {
  return {
    name: 'seo',
    transformIndexHtml() {
      return [
        { tag: 'meta', attrs: { name: 'description', content: SEO_DESC }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:title', content: `${SITE_TITLE} · ${SITE_DESC}` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:description', content: SEO_DESC }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${SITE_URL}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:title', content: `${SITE_TITLE} · ${SITE_DESC}` }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:description', content: SEO_DESC }, injectTo: 'head' },
      ]
    },
    generateBundle() {
      const posts = publishedPosts(getPosts()).map((p) => ({ ...p, lastmod: p.updatedAt.slice(0, 10) }))

      const urls: { loc: string; lastmod?: string }[] = [
        { loc: '/' },
        { loc: '/archives' },
        { loc: '/tags' },
        { loc: '/about' },
        ...posts.map((p) => ({ loc: `/posts/${p.slug}`, lastmod: p.lastmod })),
        ...Array.from(new Set(posts.map((p) => p.series).filter(Boolean))).map((s) => ({
          loc: `/series/${encodeURIComponent(s as string)}`,
        })),
        ...Array.from(new Set(posts.flatMap((p) => p.tags))).map((t) => ({
          loc: `/tags/${encodeURIComponent(t)}`,
        })),
      ]

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>
`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}

export default defineConfig({
  // GitHub Pages 部署在 /manuscript-archive/ 子路径;本地预览保持根路径
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    postsPlugin(),
    postRevisionsPlugin(),
    rssFeedPlugin(),
    githubDataPlugin(),
    seoPlugin(),
    staticPagesPlugin({ url: SITE_URL, title: SITE_TITLE, description: SEO_DESC }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
