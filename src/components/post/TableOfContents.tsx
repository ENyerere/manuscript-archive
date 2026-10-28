import { useEffect, useRef, useState } from 'react'
import type { TocItem } from '@/lib/toc'

interface TableOfContentsProps {
  items: TocItem[]
}

/**
 * 文章页右栏目录(hairline 风格)
 * - xl 断点显示、sticky 定位(由外层布局控制)
 * - 当前章节:字重 + 左侧短粗线指示,不用色块
 * - IntersectionObserver 追踪阅读位置;点击平滑滚动,reduced-motion 时瞬时跳转
 */
export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  // 点击目录跳转期间锁定高亮:平滑滚动会途经中间标题,observer 不能把高亮抢走
  const lockRef = useRef(false)
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      // 顶部让出 sticky 头部,底部收缩,使“当前章节”落在视口上 1/3 区域
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 }
    )
    headings.forEach((el) => observer.observe(el))

    // 滚动停止 150ms 后解锁(平滑滚动持续触发 scroll,天然防抖)
    const onScroll = () => {
      if (!lockRef.current) return
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = setTimeout(() => {
        lockRef.current = false
      }, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [items])

  if (items.length === 0) return null

  const scrollToHeading = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lockRef.current = true
    // 兜底:若目标已在视口内(无滚动事件),1s 后自动解锁
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    unlockTimerRef.current = setTimeout(() => {
      lockRef.current = false
    }, 1000)
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    setActiveId(id)
    // 瞬时跳转不产生连续滚动事件,直接解锁
    if (reduced) lockRef.current = false
    // 保留 history.state(React Router 的导航索引),否则后退时的滚动恢复会失效
    window.history.replaceState(window.history.state, '', `#${id}`)
  }

  return (
    <nav aria-label="文章目录">
      <div className="font-mono text-xs tracking-[0.08em] text-muted-foreground mb-4">目录</div>
      <ul className="space-y-0.5 text-sm border-l border-border">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={scrollToHeading(item.id)}
                aria-current={active ? 'location' : undefined}
                className={[
                  'block py-1.5 -ml-px border-l-2 transition-colors leading-6',
                  item.depth === 3 ? 'pl-8' : 'pl-4',
                  active
                    ? 'border-foreground text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
