import { useLayoutEffect, useRef } from 'react'
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

  return <div ref={ref} className="max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
}
