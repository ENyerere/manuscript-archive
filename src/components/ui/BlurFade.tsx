import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface BlurFadeProps {
  children: ReactNode
  className?: string
  /** 时长(秒) */
  duration?: number
  /** 延迟(秒) */
  delay?: number
  /** 位移距离(px) */
  offset?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  /** 进入视口才播放 */
  inView?: boolean
  blur?: string
}

/**
 * 模糊淡入(纯 CSS 复刻 Magic UI BlurFade,零依赖)。
 * 初始 blur + 透明 + 位移,进入视口(或挂载)后过渡到清晰。
 * 尊重 prefers-reduced-motion:直接呈现最终状态。
 */
export default function BlurFade({
  children,
  className = '',
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = 'down',
  inView = false,
  blur = '6px',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 始终先隐藏,inView 由观察器触发、否则挂载后下一帧显示——保证过渡一定发生
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (inView) {
      const el = ref.current
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { rootMargin: '-50px' },
      )
      observer.observe(el)
      return () => observer.disconnect()
    }
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [inView])

  const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X'
  const sign = direction === 'up' || direction === 'left' ? -1 : 1
  const hiddenTransform = `translate${axis}(${sign * offset}px)`

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    filter: visible ? 'blur(0px)' : `blur(${blur})`,
    transform: visible ? 'translate(0,0)' : hiddenTransform,
    transition: `opacity ${duration}s ease ${delay}s, filter ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
  }

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
