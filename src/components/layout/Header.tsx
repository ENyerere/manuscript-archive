import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { profile } from '@/data/profile'

const navItems = [
  { label: '首页', to: '/' },
  { label: '归档', to: '/archives' },
  { label: '标签', to: '/tags' },
  { label: '关于', to: '/about' },
]

export default function Header() {
  const { pathname } = useLocation()
  const isActive = (to: string) => pathname === to

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // 关闭:先播 300ms 淡出(可见性置 false),动画结束后再卸载
  const closeMenu = () => {
    setMenuVisible(false)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setMenuOpen(false), 300)
  }

  // 卸载时清理未完成的关闭定时器
  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  // 路由变化(浏览器前进/后退等)时关闭全屏导航
  useEffect(() => {
    if (menuOpen) closeMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // 打开后下一帧再加 visible,触发淡入/上浮过渡;同时锁定背景滚动。
  // 焦点必须 preventScroll:移动端浏览器会尝试把聚焦元素滚动进可视区,
  // 在滚动锁定的背景下会引起 sticky 页头瞬跳(页面顶部打开正常正是因为无需滚动)
  useEffect(() => {
    if (!menuOpen) {
      setMenuVisible(false)
      return
    }
    const raf = requestAnimationFrame(() => setMenuVisible(true))
    document.body.style.overflow = 'hidden'
    // 焦点移入对话框;卸载时还给汉堡按钮
    closeButtonRef.current?.focus({ preventScroll: true })
    const trigger = triggerRef.current
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      trigger?.focus({ preventScroll: true })
    }
  }, [menuOpen])

  // Esc 关闭;Tab 在对话框内循环,不落到背后的页面
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="w-full max-w-[var(--page-width)] mx-auto px-6 md:px-8 flex h-16 items-center justify-between">
        <Link
          to="/"
          className="font-mono text-base font-semibold tracking-tight text-foreground hover:underline underline-offset-4"
        >
          {profile.name}
        </Link>

        {/* 桌面端导航:激活态 = 墨色 + 下划线,非激活 = 静音 */}
        <nav aria-label="主导航" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                  className={`text-sm transition-colors underline-offset-4 ${
                    isActive(item.to)
                      ? 'text-foreground font-medium underline'
                      : 'text-muted-foreground hover:text-foreground hover:underline'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* 移动端:汉堡按钮 → 全屏索引页 */}
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="打开菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 移动端全屏导航:整页覆盖的「索引」,大字号序号目录 + hairline 分隔。
          portal 到 body:不嵌在 sticky 页头内,避免受页头堆叠上下文影响 */}
      {menuOpen &&
        createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="站点导航"
          className={`fixed inset-0 z-50 md:hidden bg-background flex flex-col transition-opacity duration-300 ${
            menuVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 顶行:索引标记 + 关闭 */}
          <div className="w-full max-w-[var(--page-width)] mx-auto px-6 flex h-16 items-center justify-between border-b border-border">
            <span className="font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground">
              索引 / INDEX
            </span>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={closeMenu}
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 大字号目录,逐行错位上浮 */}
          <nav className="flex-1 flex flex-col justify-center w-full max-w-[var(--page-width)] mx-auto px-6">
            {navItems.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                onClick={closeMenu}
                style={{ transitionDelay: menuVisible ? `${120 + i * 70}ms` : '0ms' }}
                className={`flex items-baseline gap-4 py-5 border-b border-border/60 transition-all duration-500 ${
                  menuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-3xl font-semibold tracking-tight text-foreground ${
                    isActive(item.to) ? 'underline underline-offset-8' : ''
                  }`}
                >
                  {item.label}
                </span>
                {isActive(item.to) && (
                  <span className="ml-auto font-mono text-xs text-muted-foreground">当前</span>
                )}
              </Link>
            ))}
          </nav>

          {/* 底部卷末标记 */}
          <div className="w-full max-w-[var(--page-width)] mx-auto px-6 py-6 border-t border-border">
            <span className="font-mono text-xs text-muted-foreground">
              {profile.name} · 手稿档案
            </span>
          </div>
        </div>,
          document.body,
        )}
    </header>
  )
}
