/// <reference types="vite/client" />

declare module 'virtual:post-revisions' {
  const value: {
    /** git 远端仓库 https 地址;git/远端不可用时为 null */
    repoUrl: string | null
    /** 当前分支名 */
    branch: string
    /** 以文章文件名(不含 .md)为键的版本记录;未提交的文件无记录 */
    revisions: Record<string, { hash: string; count: number }>
  }
  export default value
}

declare module 'virtual:posts' {
  export interface PostMeta {
    /** 文件名(不含 .md) */
    file: string
    slug: string
    title: string
    excerpt: string
    tags: string[]
    createdAt: string
    updatedAt: string
    hasDate: boolean
    published: boolean
    series?: string
    wordCount: number
  }
  export interface PostBody {
    html: string
    headings: import('@/lib/toc').TocItem[]
  }
  export const posts: PostMeta[]
  /** slug → 正文按需加载;未发布文章不在其中 */
  export const bodies: Record<string, () => Promise<{ default: PostBody }>>
}

declare module 'virtual:post-search' {
  /** slug → 小写正文纯文本 */
  const value: Record<string, string>
  export default value
}

declare module 'virtual:github-projects' {
  import type { Project } from '@/data/projects'
  const value: Project[]
  export default value
}

declare module 'virtual:github-languages' {
  const value: { name: string; percent: number }[]
  export default value
}
