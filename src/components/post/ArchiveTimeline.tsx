import type { Post } from '@/store/postStore'
import PostLink from './PostLink'

interface ArchiveTimelineProps {
  archives: { year: number; posts: Post[] }[]
}

/**
 * 归档时间线(行式):年份分组,组内条目为 等宽日期 + 标题链接,
 * hairline 分隔,与首页条目共用同一套行语言。
 */
export default function ArchiveTimeline({ archives }: ArchiveTimelineProps) {
  if (archives.length === 0) {
    return (
      <div className="py-16 border-y border-border">
        <p className="text-muted-foreground font-mono text-sm">还没有文章。</p>
      </div>
    )
  }
  return (
    <div className="space-y-12">
      {archives.map(({ year, posts }, groupIndex) => (
        <section key={year}>
          <h2 className="flex items-baseline gap-3 mb-2">
            <span className="text-xl font-semibold">{year}</span>
            <span className="font-mono text-xs text-muted-foreground">{posts.length} 篇</span>
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-up py-4 md:grid md:grid-cols-[7rem_1fr] md:gap-6"
                style={{
                  animationDelay: `calc(var(--content-delay) + ${groupIndex * 2 + index} * 100ms)`,
                }}
              >
                <span className="font-mono text-sm text-muted-foreground block mb-1 md:mb-0 md:pt-0.5">
                  {post.createdAt.slice(5, 10)}
                </span>
                <PostLink
                  slug={post.slug}
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  {post.title}
                </PostLink>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
