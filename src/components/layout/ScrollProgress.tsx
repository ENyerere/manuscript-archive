import type { RefObject } from 'react'

interface ScrollProgressProps {
  scrollProgressRef: RefObject<HTMLElement | null>
}

/**
 * 顶部阅读进度条。
 * 实现:整宽条 + transform: scaleX() 缩放(合成器渲染,不触发重排),
 * 由 useScrollAnimation 在 rAF 回调中逐帧直更 transform,无 CSS 过渡。
 */
export default function ScrollProgress({ scrollProgressRef }: ScrollProgressProps) {
  return (
    <div
      ref={scrollProgressRef as React.RefObject<HTMLDivElement>}
      className="fixed top-0 left-0 z-50 h-0.5 w-full origin-left scale-x-0 bg-primary will-change-transform"
    />
  )
}
