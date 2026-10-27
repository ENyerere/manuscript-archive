/**
 * 文章目录(TOC)工具
 * 标题锚点 id 与目录条目都在构建期 Markdown 渲染时同一遍生成(build/markdown.ts),两侧天然一致。
 * id 生成规则:slugify(文本),同一 slug 重复出现时追加 -1/-2…
 */

export interface TocItem {
  /** 标题层级:2 或 3 */
  depth: 2 | 3
  /** 标题纯文本 */
  text: string
  /** 锚点 id(与文章内标题元素的 id 一致) */
  id: string
}

/** 标题文本 → URL 友好的 slug(保留中日韩等 Unicode 字母与数字) */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
}
