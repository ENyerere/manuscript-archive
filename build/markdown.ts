import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import type { Root, Element } from 'hast'
import { slugifyHeading, type TocItem } from '../src/lib/toc'
import { proseClasses, inlineCodeClass, blockCodeClass } from '../src/lib/proseClasses'

export interface RenderedMarkdown {
  html: string
  headings: TocItem[]
  /** 正文纯文本(检索、RSS 摘要等用) */
  text: string
}

function addClass(node: Element, cls: string) {
  const existing = node.properties.className
  const list = Array.isArray(existing) ? existing.map(String) : typeof existing === 'string' ? [existing] : []
  node.properties.className = [...list, ...cls.split(' ')]
}

/** 注入正文样式、标题锚点、链接与图片属性,并顺带收集 h2/h3 目录 */
function rehypeProse(headings: TocItem[]) {
  return (tree: Root) => {
    const slugCounts = new Map<string, number>()

    visit(tree, 'element', (node, _index, parent) => {
      const tag = node.tagName

      if (tag === 'code') {
        const inPre = parent?.type === 'element' && parent.tagName === 'pre'
        addClass(node, inPre ? blockCodeClass : inlineCodeClass)
        return
      }

      if (proseClasses[tag]) addClass(node, proseClasses[tag])

      // GFM 脚注区的 h2 自带 id(供 aria 引用),不改写也不进目录
      if ((tag === 'h2' || tag === 'h3') && !node.properties.id) {
        const text = toString(node).trim()
        const base = slugifyHeading(text) || 'section'
        const count = slugCounts.get(base) ?? 0
        slugCounts.set(base, count + 1)
        const id = count === 0 ? base : `${base}-${count}`
        node.properties.id = id
        headings.push({ depth: tag === 'h2' ? 2 : 3, text, id })
      }

      if (tag === 'a') {
        const href = String(node.properties.href ?? '')
        if (!href.startsWith('#')) {
          node.properties.target = '_blank'
          node.properties.rel = ['noopener', 'noreferrer']
        }
      }

      if (tag === 'img') {
        node.properties.loading = 'lazy'
        node.properties.decoding = 'async'
      }
    })
  }
}

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const headings: TocItem[] = []
  let text = ''

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // detect:false 避免语言误猜;未注册的围栏语言退化为纯文本
    .use(rehypeHighlight, { detect: false })
    .use(rehypeProse, headings)
    .use(() => (tree: Root) => {
      text = toString(tree).replace(/\s+/g, ' ').trim()
    })
    .use(rehypeStringify)

  const html = String(processor.processSync(markdown))
  return { html, headings, text }
}
