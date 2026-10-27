/**
 * 内容管线:src/content/posts/*.md 在构建期渲染(build/posts.ts),此处只组装元数据。
 * 写作即提交——新增文章只需添加一个 .md 文件,无需改动任何代码。
 * front matter 字段约定见 README「写作指南」。
 */
import type { Post } from '@/store/postStore'
import { posts, bodies, type PostBody } from 'virtual:posts'
import postRevisions from 'virtual:post-revisions'

/** 组装版本信息:git 不可用 → null(页面隐藏 rev 行);未提交 → 空 hash(页面显示 draft) */
function toRevision(filename: string): Post['revision'] {
  if (!postRevisions.repoUrl) return null
  const entry = postRevisions.revisions[filename]
  return {
    hash: entry?.hash ?? '',
    count: entry?.count ?? 0,
    historyUrl: entry?.hash
      ? `${postRevisions.repoUrl}/commits/${postRevisions.branch}/src/content/posts/${filename}.md`
      : '',
  }
}

export const contentPosts: Post[] = posts.map(({ file, hasDate: _hasDate, ...meta }) => ({
  ...meta,
  id: meta.slug,
  revision: toRevision(file),
}))

/** 加载单篇正文;slug 不存在或未发布时返回 null */
export async function loadPostBody(slug: string): Promise<PostBody | null> {
  const loader = bodies[slug]
  return loader ? (await loader()).default : null
}

/** 检索用纯文本索引,首次检索时才下载 */
export async function loadSearchIndex(): Promise<Record<string, string>> {
  return (await import('virtual:post-search')).default
}
