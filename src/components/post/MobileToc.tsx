import { useRef } from 'react'
import type { TocItem } from '@/lib/toc'

interface MobileTocProps {
  items: TocItem[]
}

/**
 * 窄屏文章目录:元数据块下方的可折叠 hairline 区块(xl 以上由右栏 TOC 接管)。
 * 展开/收起沿用 details 约定的 + / × 标记;点击条目平滑跳转并收起。
 */
export default function MobileToc({ items }: MobileTocProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  if (items.length === 0) return null

  const jump = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    detailsRef.current?.removeAttribute('open')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // 焦点移交目标标题:读屏焦点跟随跳转,不再留在目录链接上
    target.tabIndex = -1
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(window.history.state, '', `#${id}`)
  }

  return (
    <details ref={detailsRef} className="toc-details xl:hidden border-t border-border mb-2">
      <summary className="flex items-baseline justify-between py-3 font-mono text-sm cursor-pointer select-none">
        <span>
          目录 <span className="text-muted-foreground">· {items.length} 节</span>
        </span>
      </summary>
      <nav aria-label="文章目录">
        <ul className="pb-4 border-l border-border text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={jump(item.id)}
                className={`block py-1.5 leading-6 text-muted-foreground hover:text-foreground ${
                  item.depth === 3 ? 'pl-8' : 'pl-4'
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
