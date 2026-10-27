import { useEffect, useMemo, useRef, useState } from 'react'
import { usePostStore, getPosts, getAllTags } from '@/store/postStore'
import type { Post } from '@/store/postStore'
import { loadSearchIndex } from '@/content/posts'
import PostList from '@/components/post/PostList'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** 标题、摘要、标签的小写拼接;正文文本由检索索引按需补充 */
function metaText(post: Post): string {
  return [post.title, post.excerpt, ...post.tags].join('\n').toLowerCase()
}

export default function HomePage() {
  useDocumentTitle()
  const posts = usePostStore((state) => state.posts)
  const sortedPosts = useMemo(() => getPosts(posts), [posts])
  const tags = useMemo(() => getAllTags(posts), [posts])
  // null = 全部
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  // 正文检索索引:首次聚焦或输入时才下载;就绪前只检索标题/摘要/标签
  const [bodyIndex, setBodyIndex] = useState<Record<string, string> | null>(null)
  const indexRequested = useRef(false)
  const requestIndex = () => {
    if (indexRequested.current) return
    indexRequested.current = true
    void loadSearchIndex().then(setBodyIndex)
  }

  const trimmedQuery = query.trim()
  const searching = trimmedQuery.length > 0

  const haystacks = useMemo(
    () => new Map(sortedPosts.map((p) => [p.slug, `${metaText(p)}\n${bodyIndex?.[p.slug] ?? ''}`])),
    [sortedPosts, bodyIndex],
  )
  const hits = useMemo(() => {
    if (!searching) return null
    const q = trimmedQuery.toLowerCase()
    return new Set(sortedPosts.filter((p) => haystacks.get(p.slug)?.includes(q)).map((p) => p.slug))
  }, [sortedPosts, haystacks, searching, trimmedQuery])
  const hitCount = hits?.size ?? 0

  // 「/」聚焦检索条;Esc 清空并失焦
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && target === searchRef.current) {
        setQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // 标签与检索叠加:任一条件未命中即衰减
  const isDimmed = (post: Post): boolean => {
    if (activeTag && !post.tags.includes(activeTag)) return true
    if (hits && !hits.has(post.slug)) return true
    return false
  }

  return (
    <div className="pb-8">
      {/* 3px 粗规则线:页头与内容区之间的全站签名分隔(索引页专用) */}
      <div className="h-[3px] bg-foreground" aria-hidden="true" />

      <div className="pt-10 md:pt-16">
        {/* 检索条:hairline 底线输入,「/」快捷聚焦 */}
        <div className="flex items-baseline gap-3 mb-8">
          <label
            htmlFor="post-search"
            className="font-mono text-xs text-muted-foreground tracking-[0.08em] shrink-0"
          >
            检索
          </label>
          <input
            id="post-search"
            ref={searchRef}
            type="text"
            value={query}
            onFocus={requestIndex}
            onChange={(e) => {
              requestIndex()
              setQuery(e.target.value)
            }}
            placeholder="标题 / 摘要 / 标签 / 正文"
            autoComplete="off"
            className="w-full max-w-sm bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 border-b border-border focus:border-foreground outline-none transition-colors pb-1"
          />
          <kbd className="hidden md:inline font-mono text-[10px] text-muted-foreground/70 border border-border px-1.5 py-0.5 shrink-0">
            /
          </kbd>
        </div>

        {/* 档案统计行:检索时切换为命中统计 */}
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-8">
          {searching
            ? `检索「${trimmedQuery}」· 命中 ${hitCount} / ${sortedPosts.length} 篇`
            : `共 ${sortedPosts.length} 篇手稿 · ${tags.length} 个标签`}
        </p>

        {/* 标签过滤器:bracket 约定,激活态用 > < 包裹 */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-10" role="group" aria-label="按标签过滤">
          <button
            type="button"
            aria-pressed={activeTag === null}
            onClick={() => setActiveTag(null)}
            className={`font-mono text-sm transition-colors ${
              activeTag === null
                ? 'bracket-active text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            全部
          </button>
          {tags.map(({ tag }) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`font-mono text-sm transition-colors ${
                activeTag === tag
                  ? 'bracket-active text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 文章条目:未命中条目衰减为 0.3 透明度,不移除不重排 */}
        <PostList posts={sortedPosts} isDimmed={isDimmed} />

        {/* 检索无命中的明示 */}
        {searching && hitCount === 0 && (
          <p className="font-mono text-sm text-muted-foreground pt-8">
            未检索到相符的手稿——换个关键词试试。
          </p>
        )}
      </div>
    </div>
  )
}
