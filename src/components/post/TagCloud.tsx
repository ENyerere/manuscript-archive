import { Link } from 'react-router-dom'

interface TagCloudProps {
  tags: { tag: string; count: number }[]
}

/** 标签云:等宽文字链接 + 计数,不用 Badge 色块 */
export default function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="py-16 border-y border-border">
        <p className="text-muted-foreground font-mono text-sm">还没有标签。</p>
      </div>
    )
  }
  return (
    <div className="border-y border-border py-8 flex flex-wrap gap-x-8 gap-y-4">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          to={`/tags/${encodeURIComponent(tag)}`}
          className="font-mono text-sm text-foreground hover:underline underline-offset-4 flex items-baseline gap-2"
        >
          <span>{tag}</span>
          <span className="text-xs text-muted-foreground">{count}</span>
        </Link>
      ))}
    </div>
  )
}
