import { useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { annotate } from 'rough-notation'
import type { RoughAnnotation } from 'rough-notation/lib/model.js'
import { copyButtonClass, imageFallbackClass } from '@/lib/proseClasses'

interface PostContentProps {
  /** 构建期渲染好的正文 HTML(build/markdown.ts) */
  html: string
}

/** 图片加载失败:替换为单色文字占位,不露出浏览器破图 icon */
function replaceBrokenImage(img: HTMLImageElement) {
  const fallback = document.createElement('span')
  fallback.className = imageFallbackClass
  fallback.textContent = img.alt ? `[图片:${img.alt}]` : '[图片]'
  img.replaceWith(fallback)
}

function addCopyButton(pre: HTMLPreElement): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = copyButtonClass
  button.textContent = 'copy'
  button.setAttribute('aria-label', '复制代码')
  let timer: number | undefined
  button.addEventListener('click', async () => {
    const code = pre.querySelector('code')?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(code)
      button.textContent = 'copied'
    } catch {
      button.textContent = 'failed'
    }
    window.clearTimeout(timer)
    timer = window.setTimeout(() => (button.textContent = 'copy'), 1500)
  })
  pre.appendChild(button)
  return button
}

export default function PostContent({ html }: PostContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const keyword = (searchParams.get('q') ?? '').trim()

  // 检索词马克笔高亮:对正文文本节点中的匹配处包 span 后做手绘涂抹(单色)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || !keyword) return
    const lower = keyword.toLowerCase()
    const dark = document.documentElement.classList.contains('dark')
    // 反选实色:墨底纸字(暗色反之),与全站 ::selection 的墨纸反转同一语言。
    // 单色体系下半透明涂抹对比不足,实色反转才足够醒目。
    const color = dark ? 'rgba(250,250,250,0.85)' : 'rgba(10,10,10,0.85)'
    const textColor = dark ? '#0a0a0a' : '#fafafa'
    const annotations: RoughAnnotation[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const targets: Text[] = []
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node as Text
      // 跳过代码块/脚本,只高亮可读正文
      if (text.parentElement?.closest('pre, code, script, style')) continue
      if (text.data.toLowerCase().includes(lower)) targets.push(text)
    }
    for (const text of targets) {
      let current: Text | null = text
      // 同一节点可能多处匹配,逐个切分包裹
      while (current) {
        const idx = current.data.toLowerCase().indexOf(lower)
        if (idx === -1) break
        const hit = current.splitText(idx)
        const rest = hit.splitText(keyword.length)
        const span = document.createElement('span')
        span.className = 'search-hit'
        span.style.color = textColor
        hit.parentNode?.replaceChild(span, hit)
        span.appendChild(hit)
        annotations.push(
          annotate(span, {
            type: 'highlight',
            color,
            animationDuration: 400,
            iterations: 2,
            multiline: true,
            padding: [1, 3],
          }),
        )
        current = rest
      }
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    annotations.forEach((a) => {
      if (reduced) a.animationDuration = 0
      a.show()
    })
    return () => annotations.forEach((a) => a.remove())
  }, [html, keyword])

  // layout 阶段挂载:早于图片的 error 事件派发,不会漏掉已失败的图片
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) replaceBrokenImage(e.target)
    }
    // error 事件不冒泡,只能在捕获阶段统一委托
    root.addEventListener('error', onError, true)
    root.querySelectorAll('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) replaceBrokenImage(img)
    })

    const buttons = navigator.clipboard ? Array.from(root.querySelectorAll('pre'), addCopyButton) : []

    return () => {
      root.removeEventListener('error', onError, true)
      buttons.forEach((b) => b.remove())
    }
  }, [html])

  // 段落逐行淡入(Fade In by Line):块级元素进入视口时淡入,减少动态时跳过
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const blocks = root.querySelectorAll('p, li, h2, h3, h4, blockquote, pre, table')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('fade-line-visible')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    blocks.forEach((b) => {
      b.classList.add('fade-line')
      io.observe(b)
    })
    return () => io.disconnect()
  }, [html])

  return <div ref={ref} className="max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
}
