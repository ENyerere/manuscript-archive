import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

/** 仅桌面精确指针启用;触屏与减少动态效果保持浏览器原生滚动。 */
export function shouldEnableLenis(finePointer: boolean, reducedMotion: boolean): boolean {
  return finePointer && !reducedMotion
}

function destroyLenis() {
  lenis?.destroy()
  lenis = null
}

/**
 * 初始化全站唯一的 Lenis 实例。
 * 媒体条件变化时先销毁旧实例,避免原生滚动与 Lenis 同时接管。
 */
export function initSmoothScroll(): () => void {
  const pointerQuery = window.matchMedia('(pointer: fine)')
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  const sync = () => {
    destroyLenis()
    if (!shouldEnableLenis(pointerQuery.matches, motionQuery.matches)) return

    lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
      // React Router 导航时停止上一页惯性,避免覆盖 ScrollRestoration。
      stopInertiaOnNavigate: true,
    })
  }

  pointerQuery.addEventListener('change', sync)
  motionQuery.addEventListener('change', sync)
  sync()

  return () => {
    pointerQuery.removeEventListener('change', sync)
    motionQuery.removeEventListener('change', sync)
    destroyLenis()
  }
}

/** 回到顶部;未启用 Lenis 时沿用原生的平滑/瞬时降级。 */
export function scrollToTop(reducedMotion: boolean): void {
  if (lenis) {
    lenis.scrollTo(0)
    return
  }
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
}

/** 跳转到元素;目录的焦点、hash 与高亮锁定仍由调用方负责。 */
export function scrollToElement(target: HTMLElement, reducedMotion: boolean): void {
  if (lenis) {
    lenis.scrollTo(target)
    return
  }
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}
