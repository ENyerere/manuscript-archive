const RELOAD_KEY = 'chunk-reload-at'
/** 两次自动刷新的最短间隔:防止新版本本身有问题时无限刷新 */
const MIN_INTERVAL = 10_000

/** 部署后旧 chunk 已被删除时的典型报错(Chrome / Firefox / Safari 各不相同) */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /dynamically imported module|Importing a module script failed|Unable to preload CSS|error loading dynamically imported/i.test(
    message,
  )
}

/** 本页面生命周期内是否已发起刷新(StrictMode 双重渲染、多个错误同时触发时只刷新一次) */
let pending = false

/** 刷新页面拿到新版本入口;短时间内已刷新过则返回 false,交给错误页展示 */
export function reloadOnce(): boolean {
  if (pending) return true
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < MIN_INTERVAL) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage 不可用时仍尝试刷新一次
  }
  pending = true
  window.location.reload()
  return true
}
