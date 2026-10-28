import { Link, type LinkProps } from 'react-router-dom'
import { prefetchPost } from '@/content/posts'

interface PostLinkProps extends Omit<LinkProps, 'to'> {
  slug: string
}

/** 指向文章页的链接:鼠标悬停、键盘聚焦或手指按下时预取正文,点击后几乎无需等待 */
export default function PostLink({ slug, onMouseEnter, onFocus, onTouchStart, ...props }: PostLinkProps) {
  return (
    <Link
      to={`/posts/${encodeURIComponent(slug)}`}
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
