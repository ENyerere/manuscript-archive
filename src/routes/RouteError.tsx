import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { isChunkLoadError, reloadOnce } from '@/lib/chunkReload'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * 路由错误页:替代 React Router 默认的 "Unexpected Application Error"。
 * 部署后旧 chunk 被删除导致的加载失败 → 自动刷新一次拿到新版本;其余错误给出手稿风格说明。
 */
export default function RouteError() {
  const error = useRouteError()
  const chunkError = isChunkLoadError(error)
  // 渲染期调用:刷新会立刻卸载页面,无需等 effect
  const reloading = chunkError && reloadOnce()
  useDocumentTitle('出错了')

  if (reloading) return null

  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="py-24">
      <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-4">
        {notFound ? '404' : 'ERROR'}
      </p>
      <h1 className="text-4xl font-bold mb-4">{notFound ? '页面不存在' : '这一页没能加载出来'}</h1>
      <p className="text-muted-foreground mb-8">
        {chunkError ? '站点刚刚更新过,刷新页面即可看到新版本。' : '可能是网络波动,稍后再试一次。'}
      </p>
      <div className="flex gap-8">
        <button type="button" onClick={() => window.location.reload()} className="u-line text-foreground">
          刷新页面
        </button>
        <Link to="/" className="u-line text-foreground">
          ← 返回首页
        </Link>
      </div>
    </div>
  )
}
