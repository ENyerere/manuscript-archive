import { describe, expect, it } from 'vitest'
import { feedHtml } from '../build/feedHtml'

describe('feedHtml', () => {
  it('turns article-relative image paths into absolute feed URLs', () => {
    expect(feedHtml('<img src="../post-assets/memory/dram.webp">', 'https://example.com')).toBe(
      '<![CDATA[<img src="https://example.com/post-assets/memory/dram.webp">]]>',
    )
  })

  it('keeps root-relative links compatible with the feed reader', () => {
    expect(feedHtml('<a href="/about">关于</a>', 'https://example.com/base')).toBe(
      '<![CDATA[<a href="https://example.com/base/about">关于</a>]]>',
    )
  })
})
