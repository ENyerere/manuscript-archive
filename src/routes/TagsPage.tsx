import { usePostStore, getAllTags } from '@/store/postStore'
import TagCloud from '@/components/post/TagCloud'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function TagsPage() {
  useDocumentTitle('标签')
  const posts = usePostStore((state) => state.posts)
  const tags = getAllTags(posts)

  return (
    <div className="pb-8">
      {/* 3px 粗规则线:索引页签名分隔 */}
      <div className="h-[3px] bg-foreground" aria-hidden="true" />

      <div className="pt-10 md:pt-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">标签</h1>
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-12">
          共 {tags.length} 个标签
        </p>
        <TagCloud tags={tags} />
      </div>
    </div>
  )
}
