import { usePostStore, getArchives } from '@/store/postStore'
import ArchiveTimeline from '@/components/post/ArchiveTimeline'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ArchivesPage() {
  useDocumentTitle('归档')
  const posts = usePostStore((state) => state.posts)
  const archives = getArchives(posts)
  const total = archives.reduce((sum, g) => sum + g.posts.length, 0)

  return (
    <div className="pb-8">
      {/* 3px 粗规则线:索引页签名分隔 */}
      <div className="h-[3px] bg-foreground" aria-hidden="true" />

      <div className="pt-10 md:pt-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">归档</h1>
        <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-12">
          共 {total} 篇手稿
        </p>
        <ArchiveTimeline archives={archives} />
      </div>
    </div>
  )
}
