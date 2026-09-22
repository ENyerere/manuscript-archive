import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

/** View Transitions API(TS 标准库尚未内置类型,此处最小声明) */
interface ViewTransition {
  ready: Promise<void>
}
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition
}

/**
 * iOS(WebKit)检测:iPhone/iPad/iPod,以及 iPadOS 伪装成 MacIntel 的情况。
 * iOS Safari 对 View Transitions 的快照合成有缺陷(亮度跳变、chrome 区域
 * 不同步、掉帧),因此走降级路径。
 */
function isIosWebKit(): boolean {
  const ua = navigator.userAgent
  if (/iP(hone|ad|od)/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

/**
 * 主题切换:新主题以圆形 clip-path 从点击位置扩散揭示(View Transitions API)。
 * 降级链:
 * - prefers-reduced-motion / 浏览器不支持 / iOS WebKit → 瞬时切换,
 *   并用 .theme-color-fade 做一次全站颜色渐变作为动效补偿。
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startViewTransition = (document as DocumentWithViewTransition).startViewTransition

    if (reduced || !startViewTransition || isIosWebKit()) {
      // 颜色渐变补偿:加类 → 切换 → 动画结束后移除(避免影响后续其他过渡)
      if (!reduced) {
        document.documentElement.classList.add('theme-color-fade')
        window.setTimeout(() => {
          document.documentElement.classList.remove('theme-color-fade')
        }, 350)
      }
      toggleTheme()
      return
    }

    // 键盘激活时 clientX/Y 为 0,退回按钮中心
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2

    const transition = startViewTransition.call(document, () => {
      flushSync(() => toggleTheme())
    })

    // 半径取到最远角,保证圆形覆盖全屏
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="切换主题">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
