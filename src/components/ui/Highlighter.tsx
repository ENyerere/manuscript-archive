import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'
import type { RoughAnnotation, RoughAnnotationType } from 'rough-notation/lib/model.js'
import { setPathsPlayback } from '../../lib/annotationPlayback'

interface HighlighterProps {
  children: React.ReactNode
  /** highlight=宽头笔涂抹; underline=手绘细线 */
  action?: RoughAnnotationType
  /** 标注颜色,默认取当前文字色(currentColor 不支持,故由调用方给变量) */
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number | [number, number, number, number]
  multiline?: boolean
  /** hover 模式:仅父级 .group hover 时显示(不自动播放) */
  hoverOnly?: boolean
  className?: string
}

/**
 * 手绘风文字标注(rough-notation 的轻量封装,单色改造)。
 * 默认进入视口即播放一次;hoverOnly 时由 CSS 控制显隐,用于标题 hover 细线。
 */
export default function Highlighter({
  children,
  action = 'highlight',
  color = 'currentColor',
  strokeWidth = 1.5,
  animationDuration = 500,
  iterations = 2,
  padding = 2,
  multiline = true,
  hoverOnly = false,
  className = '',
}: HighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const annotationRef = useRef<RoughAnnotation | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const annotation = annotate(el, {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    })
    annotationRef.current = annotation
    if (!hoverOnly) {
      // 尊重减少动态:直接呈现最终状态
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        annotation.animationDuration = 0
      }
      annotation.show()
    }
    return () => annotation.remove()
  }, [action, color, strokeWidth, animationDuration, iterations, padding, multiline, hoverOnly])

  // hover 模式:监听父级 group,移出时沿原路径以 1.75 倍速收回
  useEffect(() => {
    if (!hoverOnly) return
    const el = ref.current
    const group = el?.closest('.group')
    if (!el || !group) return
    const svg = el.nextElementSibling?.matches('svg.rough-annotation')
      ? el.nextElementSibling
      : null
    // 路径在首次 show() 时才生成,因此每次交互都读取当前路径
    const getPaths = () => Array.from(svg?.querySelectorAll('path') ?? []) as SVGPathElement[]
    const show = () => {
      const annotation = annotationRef.current
      if (!annotation) return
      if (annotation.isShowing()) {
        // 展开或收回途中重新进入,从当前位置继续,不重播整条线
        if (setPathsPlayback(getPaths(), 1) > 0) return
        annotation.hide()
      }
      annotation.show()
    }
    const hide = () => {
      const annotation = annotationRef.current
      if (!annotation) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduceMotion && setPathsPlayback(getPaths(), -1.75) > 0) return
      annotation.hide()
    }
    group.addEventListener('mouseenter', show)
    group.addEventListener('mouseleave', hide)
    return () => {
      group.removeEventListener('mouseenter', show)
      group.removeEventListener('mouseleave', hide)
    }
  }, [hoverOnly])

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  )
}
