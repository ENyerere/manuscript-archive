import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

describe('路由加载边界', () => {
  it.each(['ArchivesPage', 'TagsPage', 'AboutPage'])('%s 随主包加载，首次切换不请求页面 chunk', (page) => {
    expect(source).toContain(`import ${page} from '@/routes/${page}'`)
    expect(source).toContain(`element: <${page} />`)
    expect(source).not.toContain(`lazy: lazyRoute(() => import('@/routes/${page}'))`)
  })

  it('文章与次级页面保留懒加载', () => {
    for (const page of ['PostPage', 'TagPage', 'SeriesPage', 'NotFoundPage']) {
      expect(source).toContain(`import('@/routes/${page}')`)
    }
  })
})
