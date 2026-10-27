/**
 * 文章正文各元素的 Tailwind class。
 * 构建期 Markdown 渲染插件(build/markdown.ts)按标签名注入;放在 src 下是为了让 Tailwind 扫描到这些 class。
 */
export const proseClasses: Record<string, string> = {
  h1: 'text-3xl font-bold mt-12 mb-4 text-foreground',
  h2: 'text-2xl font-bold mt-10 mb-3 text-foreground scroll-mt-24',
  h3: 'text-xl font-medium mt-8 mb-2 text-foreground scroll-mt-24',
  p: 'leading-8 mb-6 text-foreground/90',
  ul: 'list-disc pl-6 mb-6 leading-8 text-foreground/90 space-y-1',
  ol: 'list-decimal pl-6 mb-6 leading-8 text-foreground/90 space-y-1',
  // 中文不使用斜体:以细线 + 静音色呈现引用
  blockquote: 'border-l-2 border-border pl-5 my-6 text-muted-foreground',
  // 代码块:明暗主题均为深色,无圆角无彩色边条;relative 供复制按钮定位
  pre: 'relative bg-[rgb(var(--codeblock-bg))] text-[#c4c4c4] p-4 rounded-sm overflow-x-auto my-6 text-sm font-mono',
  // 链接:继承墨色,常显下划线,hover 加粗下划线(不靠变色)
  a: 'text-foreground underline underline-offset-[3px] decoration-1 hover:decoration-2',
  table: 'w-full border-collapse mb-6 text-sm',
  thead: 'bg-secondary',
  th: 'border border-border px-3 py-2 text-left font-medium',
  td: 'border border-border px-3 py-2',
  input: 'mr-2 accent-foreground',
  hr: 'my-8 border-border',
  img: 'rounded-sm my-6 w-full',
}

export const inlineCodeClass = 'bg-secondary px-1.5 py-0.5 rounded-sm font-mono text-sm'
export const blockCodeClass = 'font-mono'

/** 图片加载失败时替换成的文字占位 */
export const imageFallbackClass =
  'block my-6 border border-border px-4 py-8 text-center font-mono text-sm text-muted-foreground'

/** 代码块右上角的复制按钮 */
export const copyButtonClass =
  'absolute top-2 right-2 font-mono text-xs text-[#8a8a8a] hover:text-[#e5e5e5] border border-[#3a3a3a] px-1.5 py-0.5 rounded-sm bg-[rgb(var(--codeblock-bg))] transition-colors'
