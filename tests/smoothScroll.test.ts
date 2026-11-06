import { describe, expect, it } from 'vitest'
import { shouldEnableLenis } from '@/lib/smoothScroll'

describe('shouldEnableLenis', () => {
  it('enables only fine-pointer devices without reduced motion', () => {
    expect(shouldEnableLenis(true, false)).toBe(true)
    expect(shouldEnableLenis(false, false)).toBe(false)
    expect(shouldEnableLenis(true, true)).toBe(false)
    expect(shouldEnableLenis(false, true)).toBe(false)
  })
})
