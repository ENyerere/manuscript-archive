import { ArrowUp } from 'lucide-react'

interface BackToTopProps {
  visible: boolean
  onClick: () => void
}

/** 回到顶部:纸面底 + hairline 边框的方形按钮,无阴影;常驻 DOM,以透明度淡入淡出 */
export default function BackToTop({ visible, onClick }: BackToTopProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="回到顶部"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-background text-muted-foreground transition-[opacity,color,border-color] duration-300 hover:text-foreground hover:border-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
