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
      <ScrollProgress scrollProgressRef={scrollProgressRef} />
      <Header />

      {/* 单栏纸面布局:最大宽度 72rem,索引页大留白由页面自身控制 */}
      <main id="swup-container" className="flex-1 w-full max-w-[var(--page-width)] mx-auto px-6 md:px-8">
        <Outlet />
      </main>

      <Footer />
      <BackToTop visible={backToTopVisible} onClick={scrollToTop} />
      {/* 新导航回到顶部,前进/后退恢复原滚动位置 */}
      <ScrollRestoration />
    </div>
  )
}
