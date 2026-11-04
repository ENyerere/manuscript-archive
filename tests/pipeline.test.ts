import { describe, it, expect } from 'vitest'
import { parseFrontMatter } from '../src/lib/frontMatter'
import { renderMarkdown } from '../build/markdown'
import { loadPosts, publishedPosts } from '../build/posts'

/**
 * 构建管线核心单测:覆盖"改错了不会立刻发现、但会悄悄出错"的环节。
 * 纯函数(frontMatter / markdown)+ 真实文章目录的集成断言。
 */

describe('parseFrontMatter', () => {
  it('解析标量并保留类型', () => {
    const { data, body } = parseFrontMatter('---\ntitle: 测试\ncount: 3\ndraft: false\n---\n正文')
    expect(data.title).toBe('测试')
    expect(data.count).toBe(3)
    expect(data.draft).toBe(false)
    expect(body.trim()).toBe('正文')
  })

  it('行内数组与块级数组等价', () => {
    const inline = parseFrontMatter('---\ntags: [随笔, 个人]\n---\nx')
    expect(inline.data.tags).toEqual(['随笔', '个人'])
    const block = parseFrontMatter('---\ntags:\n  - 随笔\n  - 个人\n---\nx')
    expect(block.data.tags).toEqual(['随笔', '个人'])
  })

  it('引号包裹的值允许含冒号', () => {
    const { data } = parseFrontMatter('---\nexcerpt: "含:冒号"\n---\nx')
    expect(data.excerpt).toBe('含:冒号')
  })

  it('无 front matter 时 data 为空、正文原样保留', () => {
    const { data, body } = parseFrontMatter('# 标题\n正文')
    expect(data).toEqual({})
    expect(body).toContain('正文')
  })
})

describe('renderMarkdown', () => {
  it('收集 h2/h3 目录,重名标题锚点 id 去重', () => {
    const { headings, html } = renderMarkdown('## 第一节\n\n内容\n\n### 小节\n\n## 第一节')
    expect(headings.map((h) => h.text)).toEqual(['第一节', '小节', '第一节'])
    expect(headings.map((h) => h.depth)).toEqual([2, 3, 2])
    const ids = headings.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(html).toContain('id=')
  })

  it('http 外链新开窗口,站内路径与锚点不新开', () => {
    const { html } = renderMarkdown('[外](https://example.com) [内](/about) [锚](#sec)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).not.toContain('href="/about" target')
    expect(html).not.toContain('href="#sec" target')
  })

  it('提取正文纯文本(去掉标记符号)', () => {
    const { text } = renderMarkdown('# 标题\n\n这是**加粗**正文。')
    expect(text).toContain('标题')
    expect(text).toContain('加粗')
    expect(text).not.toContain('**')
  })
})

describe('构建管线(真实文章目录)', () => {
  const posts = loadPosts()

  it('每篇都有标题,slug 全局唯一', () => {
    expect(posts.length).toBeGreaterThan(0)
    for (const p of posts) expect(p.title.length).toBeGreaterThan(0)
    const slugs = posts.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('标签均在白名单内(loadPosts 未抛错即通过)', () => {
    for (const p of posts) for (const t of p.tags) expect(typeof t).toBe('string')
  })

  it('publishedPosts 过滤未发布/非法日期并按日期倒序', () => {
    const pub = publishedPosts(posts)
    for (const p of pub) {
      expect(p.published).toBe(true)
      expect(p.hasDate).toBe(true)
    }
    for (let i = 1; i < pub.length; i++) {
      expect(pub[i - 1].createdAt >= pub[i].createdAt).toBe(true)
    }
  })
})
