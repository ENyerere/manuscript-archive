import { useParams, Link } from 'react-router-dom'
import { usePostStore, getSeriesPosts } from '@/store/postStore'
import PostList from '@/components/post/PostList'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * 系列合集页:按时间正序列出同系列文章(第 1 篇在前,符合阅读顺序)。
 * 系列名经 URL 编码传入,与标签路由 (/tags/:tag) 同一约定。
 */
export default function SeriesPage() {
  const { name } = useParams<{ name: string }>()
  const posts = usePostStore((state) => state.posts)
  const seriesName = name ? decodeURIComponent(name) : ''
  const seriesPosts = seriesName ? getSeriesPosts(posts, seriesName) : []
  useDocumentTitle(seriesPosts.length > 0 ? `系列:${seriesName}` : '系列不存在')

  if (!seriesName || seriesPosts.length === 0) {
    return (
      <div className="py-24">
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-4">404</p>
        <h1 className="text-4xl font-bold mb-4">系列不存在</h1>
        <p className="text-muted-foreground mb-8">这个系列不存在或其中没有已发布的文章。</p>
        <Link to="/" className="u-line text-foreground">
          ← 返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* 3px 签名规则线,与首页一致 */}
      <div className="h-[3px] bg-foreground" aria-hidden="true" />

      <div className="pt-10 md:pt-16">
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-2">系列</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-6">{seriesName}</h1>
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-10">
          共 {seriesPosts.length} 篇 · 始于 {seriesPosts[0].createdAt.slice(0, 10)}
        </p>

        {/* 系列内文章按时间正序 */}
        <PostList posts={seriesPosts} />
      </div>
    </div>
  )
}
