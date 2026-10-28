import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollProgress from './ScrollProgress'
import BackToTop from './BackToTop'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function Layout() {
  const { scrollProgressRef, backToTopVisible, scrollToTop } = useScrollAnimation()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 跳到正文:键盘用户 Tab 第一站,聚焦时才显示 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-background focus:text-foreground focus:border focus:border-foreground focus:px-3 focus:py-1.5 font-mono text-sm"
      >
        跳到正文
      </a>
      <ScrollProgress scrollProgressRef={scrollProgressRef} />
      <Header />

      {/* 单栏纸面布局:最大宽度 72rem,索引页大留白由页面自身控制 */}
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-[var(--page-width)] mx-auto px-6 md:px-8 outline-none"
      >
        <Outlet />
      </main>

      <Footer />
      <BackToTop visible={backToTopVisible} onClick={scrollToTop} />
      {/* 新导航回到顶部,前进/后退恢复原滚动位置 */}
      <ScrollRestoration />
    </div>
  )
}
