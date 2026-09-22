import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
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

  // 路由变化(点击链接跳转)时关闭全屏导航
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // 打开后下一帧再加 visible,触发淡入/上浮过渡;同时锁定背景滚动
  useEffect(() => {
    if (!menuOpen) {
      setMenuVisible(false)
      return
    }
    const raf = requestAnimationFrame(() => setMenuVisible(true))
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Esc 关闭
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
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
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-6">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.to}>
                <NavigationMenuLink asChild>
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
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* 移动端:汉堡按钮 → 全屏索引页 */}
          <Button
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

      {/* 移动端全屏导航:整页覆盖的「索引」,大字号序号目录 + hairline 分隔 */}
      {menuOpen && (
        <div
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
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
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
                onClick={() => setMenuOpen(false)}
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
        </div>
      )}
    </header>
  )
}
