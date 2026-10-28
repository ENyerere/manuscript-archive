import { createElement, useLayoutEffect, useRef, useState } from 'react'
import { wrapLines } from '@/lib/lineReveal'

interface LineRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
}

/** 等字体就绪的上限:网络慢时不让标题一直隐藏 */
const FONT_WAIT_MS = 300

/**
 * 标题逐行揭示(全站唯一签名动效,仅用于文章页 H1 等签名位置)。
 * - useLayoutEffect 内同步完成行包裹,首帧即处于 translateY(103%) 隐藏态,无闪烁
 * - 字体就绪(最多等 300ms)后按最终字形重新分行,再双 rAF 加 ready 类触发过渡:1400ms,逐行错峰
 * - 宽度变化(旋转屏幕、拖动窗口)时按新宽度重新分行;此时已是 ready 态,新行直接呈现终态,不重播动画
 * - prefers-reduced-motion:不拆分、不动画,标题直接静态呈现
 * - 视觉文本置于 aria-hidden 的行 span,元素本身以 aria-label 提供无障碍文本
 */
export default function LineReveal({ text, as = 'h1', className = '' }: LineRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    wrapLines(el, text)

    let cancelled = false
    let raf = 0
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ])
    void fontsReady.then(() => {
      if (cancelled) return
      wrapLines(el, text)
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setReady(true))
      })
    })

    let lastWidth = el.getBoundingClientRect().width
    let resizeRaf = 0
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width === lastWidth) return
      lastWidth = width
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => wrapLines(el, text))
    })
    observer.observe(el)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeRaf)
      observer.disconnect()
    }
  }, [text])

  return createElement(
    as,
    {
      ref,
      className: `${className}${ready ? ' line-reveal-ready' : ''}`,
      'aria-label': text,
    },
    text,
  )
}
