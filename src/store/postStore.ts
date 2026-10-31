import { create } from 'zustand'
import { contentPosts } from '@/content/posts'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  /** 正文字数(去空白后的字符数,构建期统计);正文 HTML 由 loadPostBody 按需加载 */
  wordCount: number
  tags: string[]
  createdAt: string // ISO 8601 字符串
  updatedAt: string // ISO 8601 字符串
  published: boolean
  /** 所属系列名;未设置则不参与任何系列 */
  series?: string
  /** 版本信息:hash 为空串表示未提交(draft);null 表示 git 不可用(页面隐藏 rev 行) */
  revision: { hash: string; count: number; historyUrl: string } | null
}

interface PostState {
  // 只读:文章唯一权威数据源是 src/content/posts/*.md,构建期加载,
  // 不存在运行期增删改;要改文章就改 .md 文件重新构建
  posts: Post[]
}

export const usePostStore = create<PostState>()(() => ({
  posts: contentPosts, // 构建期从 .md 文件加载
}))

// 选择器函数(纯函数,便于在组件中调用)

// 获取已发布文章,按 createdAt 倒序
export function getPosts(posts: Post[]): Post[] {
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 按 slug 获取文章
export function getPostBySlug(posts: Post[], slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug && p.published)
}

// 按标签获取文章
export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return getPosts(posts).filter((p) => p.tags.includes(tag))
}

// 按系列获取文章,按 createdAt 正序(第 1 篇在前,符合阅读顺序)
export function getSeriesPosts(posts: Post[], series: string): Post[] {
  return posts
    .filter((p) => p.published && p.series === series)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

// 文章在所属系列中的位置;不属于任何系列返回 null
export function getSeriesInfo(
  posts: Post[],
  post: Post,
): { name: string; index: number; total: number } | null {
  if (!post.series) return null
  const list = getSeriesPosts(posts, post.series)
  const index = list.findIndex((p) => p.slug === post.slug)
  return index === -1 ? null : { name: post.series, index: index + 1, total: list.length }
}

// 获取所有标签(去重,按文章数倒序)
export function getAllTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>()
  getPosts(posts).forEach((p) => {
    p.tags.forEach((tag) => {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    })
  })
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// 按年份分组归档
export function getArchives(posts: Post[]): { year: number; posts: Post[] }[] {
  const sorted = getPosts(posts)
  const map = new Map<number, Post[]>()
  sorted.forEach((p) => {
    const year = new Date(p.createdAt).getFullYear()
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(p)
  })
  return Array.from(map.entries())
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }))
    .sort((a, b) => b.year - a.year)
}
