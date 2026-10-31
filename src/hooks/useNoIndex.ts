import { useEffect } from 'react'

/**
 * 软 404 治理:渲染期间向 head 注入 <meta name="robots" content="noindex, nofollow">。
 * 静态托管对无效路径回退 SPA 时 HTTP 状态恒为 200,靠 noindex 告知爬虫不要收录。
 * active 变回 false 或组件卸载时恢复原状,不影响正常页面。
 */
export function useNoIndex(active = true) {
  useEffect(() => {
    if (!active) return
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (existing) {
      const prev = existing.content
      existing.content = 'noindex, nofollow'
      return () => {
        existing.content = prev
      }
    }
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [active])
}
