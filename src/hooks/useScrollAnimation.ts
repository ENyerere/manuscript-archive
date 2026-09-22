import { useRef, useState, useEffect, useCallback } from 'react'

/** 用户是否偏好减少动态效果 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 滚动动画 Hook
 * 管理顶部进度条缩放与回到顶部按钮显隐。
 * 所有动画均尊重 prefers-reduced-motion(平滑滚动退化为瞬时跳转)。
 */
export function useScrollAnimation() {
  // 绑定到 .scroll-progress 元素
  const scrollProgressRef = useRef<HTMLElement | null>(null)
  // 回到顶部按钮是否可见
  const [backToTopVisible, setBackToTopVisible] = useState<boolean>(false)

  // 滚动到顶部(reduced-motion 时瞬时跳转)
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    // rAF 节流:滚动事件合并到每帧一次,进度条 transform 逐帧直更(不触发重排)
    let ticking = false

    const update = () => {
      ticking = false
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0

      // scaleX 进度:合成器缩放,视觉与 width 一致但无 reflow
      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.transform = `scaleX(${scrollPercent})`
      }

      // 更新回到顶部按钮显隐
      setBackToTopVisible(scrollTop > 300)
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()

    // passive: true 避免滚动事件阻塞主线程导致卡顿
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return { scrollProgressRef, backToTopVisible, scrollToTop }
}
