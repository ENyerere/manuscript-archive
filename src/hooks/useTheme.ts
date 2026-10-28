import { useState, useEffect, useCallback } from 'react'

const THEME_STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** 用户是否手动选过主题;没选过则一直跟随系统 */
function readStored(): 'dark' | 'light' | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

export function useTheme() {
  // index.html 内联脚本已在首帧前按同一规则设好 dark class,这里直接读取,保证一致
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)

    // 同步浏览器 chrome(网址栏/状态栏/灵动岛两侧)取色,立即跟随当前主题
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = isDark ? '#0a0a0a' : '#fafafa'
  }, [isDark])

  // 未手动选择时跟随系统深浅色变化
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => {
      if (!readStored()) setIsDark(e.matches)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // 只有用户主动切换才持久化
  const toggleTheme = useCallback(() => {
    const next = !isDark
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // 隐私模式等不可写场景:本次会话内仍生效
    }
    setIsDark(next)
  }, [isDark])

  return { isDark, toggleTheme }
}
