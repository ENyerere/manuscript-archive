import { Link } from 'react-router-dom'
import type { Post } from '@/store/postStore'
import { usePostStore, getSeriesInfo } from '@/store/postStore'
import PostLink from './PostLink'

/** 系列序号的中文表述:其一 / 其二 / … */
const CN_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
function seriesOrdinal(n: number): string {
  return n >= 1 && n <= 10 ? `其${CN_NUMERALS[n - 1]}` : `第 ${n} 篇`
}

interface PostCardProps {
  post: Post
  /** 入场错峰序号 */
  index: number
  /** 过滤器未命中时衰减为 0.3 透明度(不移除、不重排) */
  dimmed?: boolean
}

/**
 * 文章条目(行式,无卡片):
 * 左侧等宽日期栏 + 标题 + 静音摘要 + 等宽元信息行,条目间 hairline 分隔。
 * 桌面端奇数条目右移 2rem,呼应「散落手稿」的错落节奏。
 */
export default function PostCard({ post, index, dimmed = false }: PostCardProps) {
  const posts = usePostStore((state) => state.posts)
  const series = getSeriesInfo(posts, post)
  const date = post.createdAt.slice(0, 10)
  const wordCount = post.wordCount
  const readTime = Math.max(1, Math.ceil(wordCount / 300))

  return (
    <div className={`transition-opacity duration-300 ${dimmed ? 'opacity-30' : ''}`}>
      <div
        className="animate-fade-up py-6 md:py-7 md:grid md:grid-cols-[7rem_1fr] md:gap-6 md:odd:ml-8"
        style={{ animationDelay: `calc(var(--content-delay) + ${index} * 100ms)` }}
      >
        {/* 等宽元数据栏:日期 */}
        <div className="font-mono text-sm text-muted-foreground mb-1.5 md:mb-0 md:pt-1">
          {date}
        </div>

        <div className="min-w-0">
          <PostLink
            slug={post.slug}
            className="block text-xl md:text-2xl font-semibold tracking-[-0.015em] text-foreground hover:underline underline-offset-4 mb-2"
          >
            {post.title}
          </PostLink>

          <p className="text-muted-foreground leading-7 mb-3 line-clamp-2">{post.excerpt}</p>

          {/* 等宽元信息行:标签 · 字数 · 时长 */}
          <div className="font-mono text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {post.tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && ' · '}
                  <Link to={`/tags/${encodeURIComponent(tag)}`} className="hover:text-foreground hover:underline underline-offset-2">
                    {tag}
                  </Link>
                </span>
              ))}
            </span>
            <span aria-hidden="true">/</span>
            <span>{wordCount} 字</span>
            <span aria-hidden="true">/</span>
            <span>{readTime} 分钟</span>
            {/* 系列标注:系列名 · 序号,链到合集页 */}
            {series && (
              <>
                <span aria-hidden="true">/</span>
                <Link
                  to={`/series/${encodeURIComponent(series.name)}`}
                  className="hover:text-foreground hover:underline underline-offset-2"
                >
                  {series.name} · {seriesOrdinal(series.index)}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
