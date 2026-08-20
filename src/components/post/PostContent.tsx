import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'
import { buildHeadingIdMap, getNodeText, slugifyHeading } from '@/lib/toc'

interface PostContentProps {
  content: string
}

/** 从 heading 的 hast node 计算锚点 id:优先按源码行号对齐提取侧,兜底用文本 slug */
function headingId(node: unknown, idMap: Map<number, string>): string {
  const line = (node as { position?: { start?: { line?: number } } } | undefined)?.position?.start?.line
  if (line !== undefined) {
    const mapped = idMap.get(line)
    if (mapped) return mapped
  }
  return slugifyHeading(getNodeText(node)) || 'section'
}

function createComponents(idMap: Map<number, string>): Components {
  return {
    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-12 mb-4 text-foreground" {...props} />,
    h2: ({ node, ...props }) => (
      <h2 id={headingId(node, idMap)} className="text-2xl font-bold mt-10 mb-3 text-foreground scroll-mt-24" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 id={headingId(node, idMap)} className="text-xl font-medium mt-8 mb-2 text-foreground scroll-mt-24" {...props} />
    ),
    p: ({ node, ...props }) => <p className="leading-8 mb-6 text-foreground/90" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 leading-8 text-foreground/90 space-y-1" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 leading-8 text-foreground/90 space-y-1" {...props} />,
    blockquote: ({ node, ...props }) => (
      // 中文不使用斜体:以细线 + 静音色呈现引用
      <blockquote className="border-l-2 border-border pl-5 my-6 text-muted-foreground" {...props} />
    ),
    code: ({ node, className, children, ...props }) => {
      const isInline = !className
      if (isInline) return <code className="bg-secondary px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props}>{children}</code>
      return <code className={`${className} font-mono`} {...props}>{children}</code>
    },
    pre: ({ node, ...props }) => (
      // 代码块:明暗主题均为深色,无圆角无彩色边条
      <pre className="bg-[rgb(var(--codeblock-bg))] text-[#c4c4c4] p-4 rounded-sm overflow-x-auto my-6 text-sm font-mono" {...props} />
    ),
    // 链接:继承墨色,常显下划线,hover 加粗下划线(不靠变色)
    a: ({ node, ...props }) => <a className="text-foreground underline underline-offset-[3px] decoration-1 hover:decoration-2" target="_blank" rel="noopener noreferrer" {...props} />,
    table: ({ node, ...props }) => <table className="w-full border-collapse mb-6 text-sm" {...props} />,
    thead: ({ node, ...props }) => <thead className="bg-secondary" {...props} />,
    th: ({ node, ...props }) => <th className="border border-border px-3 py-2 text-left font-medium" {...props} />,
    td: ({ node, ...props }) => <td className="border border-border px-3 py-2" {...props} />,
    input: ({ node, ...props }) => <input className="mr-2 accent-foreground" disabled type="checkbox" {...props} />,
    hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
    // 图片加载失败:替换为单色文字占位,不露出浏览器破图 icon
    img: ({ node, alt, ...props }) => (
      <img
        alt={alt}
        className="rounded-sm my-6 w-full"
        onError={(e) => {
          const fallback = document.createElement('span')
          fallback.className =
            'block my-6 border border-border px-4 py-8 text-center font-mono text-sm text-muted-foreground'
          fallback.textContent = alt ? `[图片:${alt}]` : '[图片]'
          e.currentTarget.replaceWith(fallback)
        }}
        {...props}
      />
    ),
  }
}

export default function PostContent({ content }: PostContentProps) {
  // 行号 → id 映射随内容重建;组件表随之重建,保证两侧锚点一致
  const idMap = useMemo(() => buildHeadingIdMap(content), [content])
  const components = useMemo(() => createComponents(idMap), [idMap])

  return (
    <div className="max-w-none">
      {/* detect:false 避免语言误猜;ignoreMissing 让未注册的围栏语言退化为纯文本 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
