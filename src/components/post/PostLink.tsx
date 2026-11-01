import { Link, type LinkProps } from 'react-router-dom'
import { prefetchPost } from '@/content/posts'

interface PostLinkProps extends Omit<LinkProps, 'to'> {
  slug: string
  /** 检索词:带上后文章页对正文匹配处做马克笔高亮 */
  query?: string
}

/** 指向文章页的链接:鼠标悬停、键盘聚焦或手指按下时预取正文,点击后几乎无需等待 */
export default function PostLink({ slug, query, onMouseEnter, onFocus, onTouchStart, ...props }: PostLinkProps) {
  const to = `/posts/${encodeURIComponent(slug)}${query ? `?q=${encodeURIComponent(query)}` : ''}`
  return (
    <Link
      to={to}
      onMouseEnter={(e) => {
        prefetchPost(slug)
        onMouseEnter?.(e)
      }}
      onFocus={(e) => {
        prefetchPost(slug)
        onFocus?.(e)
      }}
      onTouchStart={(e) => {
        prefetchPost(slug)
        onTouchStart?.(e)
      }}
      {...props}
    />
  )
}
