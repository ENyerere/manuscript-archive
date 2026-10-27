import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('页面不存在')
  return (
    <div className="py-24">
      <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-4">404</p>
      <h1 className="text-4xl font-bold mb-4">页面不存在</h1>
      <p className="text-muted-foreground mb-8">页面不存在或已被移除。</p>
      <Link to="/" className="u-line text-foreground">
        ← 返回首页
      </Link>
    </div>
  )
}
