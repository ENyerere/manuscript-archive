import { useEffect } from 'react'

export const SITE_TITLE = '小峄热心市民'

/** 设置页面标题:传入页面名则为「页面名 · 站点名」,不传则为站点名 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_TITLE}` : SITE_TITLE
  }, [title])
}
