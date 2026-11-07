import { describe, expect, it, vi } from 'vitest'
import { setPathsPlayback } from '../src/lib/annotationPlayback'

describe('setPathsPlayback', () => {
  it('reverses existing path animations without recreating their SVG paths', () => {
    const animation = { updatePlaybackRate: vi.fn(), play: vi.fn() }
    const path = { getAnimations: () => [animation] } as unknown as SVGPathElement

    expect(setPathsPlayback([path], -1.75)).toBe(1)
    expect(animation.updatePlaybackRate).toHaveBeenCalledWith(-1.75)
    expect(animation.play).toHaveBeenCalledOnce()
  })

  it('reports when there is no active path animation to reverse', () => {
    const path = { getAnimations: () => [] } as unknown as SVGPathElement
    expect(setPathsPlayback([path], -1.75)).toBe(0)
  })
})
