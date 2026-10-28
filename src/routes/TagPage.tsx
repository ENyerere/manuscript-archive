import { useParams, Link } from 'react-router-dom'
import { usePostStore, getPostsByTag, getAllTags } from '@/store/postStore'
import PostList from '@/components/post/PostList'
import { ArrowLeft } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>()
  const posts = usePostStore((state) => state.posts)
  const filtered = tag ? getPostsByTag(posts, tag) : []
  // 标签是否真实存在(白名单内且有已发布文章);无效标签给 404 页,避免软 404
  const exists = !!tag && getAllTags(posts).some((t) => t.tag === tag)
  useDocumentTitle(exists ? `#${tag}` : '标签不存在')

  if (!exists) {
    return (
      <div className="py-24">
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-4">404</p>
        <h1 className="text-4xl font-bold mb-4">标签不存在</h1>
        <p className="text-muted-foreground mb-8">这个标签不存在或对应文章尚未发布。</p>
        <Link to="/tags" className="u-line text-foreground">
          ← 所有标签
        </Link>
      </div>
    )
  }

  return (
    <div className="py-4 md:py-6 pb-8">
      {/* 返回链接:纯文字,与内容左缘对齐 */}
      <Link
        to="/tags"
        className="inline-flex items-center gap-1.5 mb-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />所有标签
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        <span className="text-muted-foreground font-normal">#</span>
        {tag}
      </h1>
      <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-12">
        共 {filtered.length} 篇手稿
      </p>

      <PostList posts={filtered} />
    </div>
  )
}
