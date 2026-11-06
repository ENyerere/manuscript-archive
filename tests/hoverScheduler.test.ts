import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHoverScheduler } from '../src/lib/hoverScheduler'

describe('createHoverScheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('commits only after the intended hover delay', () => {
    const scheduler = createHoverScheduler(400)
    const commit = vi.fn()
    scheduler.schedule(commit)
    vi.advanceTimersByTime(399)
    expect(commit).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(commit).toHaveBeenCalledOnce()
  })

  it('cancels the previous day when hover moves to another day', () => {
    const scheduler = createHoverScheduler(400)
    const first = vi.fn()
    const second = vi.fn()
    scheduler.schedule(first)
    vi.advanceTimersByTime(250)
    scheduler.schedule(second)
    vi.advanceTimersByTime(399)
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(second).toHaveBeenCalledOnce()
  })

  it('cancels a pending commit when the pointer leaves', () => {
    const scheduler = createHoverScheduler(400)
    const commit = vi.fn()
    scheduler.schedule(commit)
    scheduler.cancel()
    vi.advanceTimersByTime(500)
    expect(commit).not.toHaveBeenCalled()
  })
})
