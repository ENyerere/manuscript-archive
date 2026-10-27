import { useParams, useLoaderData, Link } from 'react-router-dom'
import type { PostBody } from 'virtual:posts'
import { usePostStore, getPostBySlug, getPosts, getSeriesPosts } from '@/store/postStore'
import PostContent from '@/components/post/PostContent'
import TableOfContents from '@/components/post/TableOfContents'
import LineReveal from '@/components/LineReveal'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  // 路由 loader 预先加载的正文;未发布或不存在时为 null
  const body = useLoaderData() as PostBody | null
  const posts = usePostStore((state) => state.posts)
  const post = slug ? getPostBySlug(posts, slug) : undefined
  const tocItems = body?.headings ?? []
  useDocumentTitle(post && body ? post.title : '文章不存在')

  if (!post || !body) {
    return (
      <div className="py-24">
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-4">404</p>
        <h1 className="text-4xl font-bold mb-4">文章不存在</h1>
        <p className="text-muted-foreground mb-8">这篇文章不存在或已被移除。</p>
        <Link to="/" className="u-line text-foreground">
          ← 返回首页
        </Link>
      </div>
    )
  }

  const date = post.createdAt.slice(0, 10)
  const sortedPosts = getPosts(posts) // 全站按日期倒序
  const currentIndex = sortedPosts.findIndex(p => p.slug === post.slug)
  // 全站前后篇:older = 更早发布(上一篇),newer = 更新发布(下一篇)
  const globalOlder = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
  const globalNewer = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null
  // 系列感知:系列内前后篇优先,走到系列边界才退回全站
  const seriesList = post.series ? getSeriesPosts(posts, post.series) : []
  const seriesIndex = seriesList.findIndex(p => p.slug === post.slug)
  const seriesInfo = seriesIndex === -1 ? null : { index: seriesIndex + 1, total: seriesList.length }
  const olderPost = seriesIndex > 0 ? seriesList[seriesIndex - 1] : globalOlder
  const newerPost =
    seriesIndex !== -1 && seriesIndex < seriesList.length - 1
      ? seriesList[seriesIndex + 1]
      : globalNewer
  const wordCount = post.wordCount
  const readTime = Math.max(1, Math.ceil(wordCount / 300))

  return (
    <div className="py-4 md:py-6 xl:grid xl:grid-cols-[1fr_minmax(0,42rem)_1fr] xl:gap-8">
      {/* 中栏:居中阅读栏(measure 约 68 字符) */}
      <div className="xl:col-start-2 w-full max-w-[42rem] mx-auto xl:mx-0">
        {/* 返回链接:纯文字,与内容左缘对齐 */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />返回
        </Link>

        <article>
          {/* 签名动效:标题逐行揭示 */}
          <LineReveal
            text={post.title}
            as="h1"
            className="text-3xl md:text-4xl font-bold mb-8"
          />

          {/* YAML 元数据块:等宽、固定宽标签 + 内联值 */}
          <div className="font-mono text-sm leading-7 mb-8" aria-label="文章元数据">
            <div className="flex">
              <span className="w-[6em] shrink-0 text-muted-foreground">date:</span>
              <span>{date}</span>
            </div>
            <div className="flex">
              <span className="w-[6em] shrink-0 text-muted-foreground">tags:</span>
              <span>
                [
                {post.tags.map((tag, i) => (
                  <span key={tag}>
                    {i > 0 && ', '}
                    <Link to={`/tags/${tag}`} className="hover:underline underline-offset-2">
                      {tag}
                    </Link>
                  </span>
                ))}
                ]
              </span>
            </div>
            {/* 所属系列:系列名链到合集页,标注序号 */}
            {seriesInfo && post.series && (
              <div className="flex">
                <span className="w-[6em] shrink-0 text-muted-foreground">series:</span>
                <span>
                  [
                  <Link
                    to={`/series/${encodeURIComponent(post.series)}`}
                    className="hover:underline underline-offset-2"
                  >
                    {post.series}
                  </Link>
                  ] <span className="text-muted-foreground">第 {seriesInfo.index} / {seriesInfo.total} 篇</span>
                </span>
              </div>
            )}
            <div className="flex">
              <span className="w-[6em] shrink-0 text-muted-foreground">words:</span>
              <span>{wordCount}</span>
            </div>
            <div className="flex">
              <span className="w-[6em] shrink-0 text-muted-foreground">time:</span>
              <span>{readTime} min</span>
            </div>
            {/* 版本历史:短 hash 链到 GitHub 该文件的提交历史;未提交显示 draft */}
            {post.revision && (
              <div className="flex">
                <span className="w-[6em] shrink-0 text-muted-foreground">rev:</span>
                {post.revision.hash ? (
                  <span>
                    <a
                      href={post.revision.historyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline underline-offset-2"
                    >
                      {post.revision.hash}
                    </a>
                    {post.revision.count > 1 && (
                      <span className="text-muted-foreground"> (r{post.revision.count})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">draft</span>
                )}
              </div>
            )}
          </div>

          {/* hairline 后的正文 */}
          <div className="border-t border-border pt-2">
            <PostContent html={body.html} />
          </div>
        </article>

        {/* 上一篇/下一篇:hairline 文字链接行,系列内优先 */}
        {(olderPost || newerPost) && (
          <nav className="border-t border-border mt-16 pt-6 flex justify-between gap-6 text-sm">
            {olderPost ? (
              <Link to={`/posts/${olderPost.slug}`} className="group max-w-[45%]">
                <span className="font-mono text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                  <ArrowLeft className="h-3 w-3" />上一篇
                </span>
                <span className="group-hover:underline underline-offset-4 line-clamp-2">
                  {olderPost.title}
                </span>
              </Link>
            ) : <span />}
            {newerPost ? (
              <Link to={`/posts/${newerPost.slug}`} className="group max-w-[45%] text-right ml-auto">
                <span className="font-mono text-xs text-muted-foreground flex items-center justify-end gap-1 mb-1.5">
                  下一篇<ArrowRight className="h-3 w-3" />
                </span>
                <span className="group-hover:underline underline-offset-4 line-clamp-2">
                  {newerPost.title}
                </span>
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>

      {/* 右栏:TOC 目录(xl 断点显示——覆盖笔记本宽度,sticky 定位) */}
      {tocItems.length > 0 && (
        <aside className="hidden xl:block xl:col-start-3">
          <div className="sticky top-20">
            <TableOfContents items={tocItems} />
          </div>
        </aside>
      )}
    </div>
  )
}
