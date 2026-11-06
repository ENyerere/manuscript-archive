import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseContributions } from '../build/githubContributions'
import { formatContributionDay, formatContributionMonth } from '../src/lib/contributions'

const html = `
  <td data-date="2026-11-01" id="day-a" data-level="1"></td>
  <tool-tip for="day-a">3 contributions on November 1st.</tool-tip>
  <td data-level="0" id="day-b" data-date="2026-11-02"></td>
  <tool-tip for="day-b">No contributions on November 2nd.</tool-tip>
  <td id="day-c" data-date="2026-12-03" data-level="4"></td>
  <tool-tip for="day-c">1,234 contributions on December 3rd.</tool-tip>
`

describe('parseContributions', () => {
  it('parses dates, levels and exact counts from GitHub contribution HTML', () => {
    expect(parseContributions(html)).toEqual({
      total: 1237,
      days: [
        { date: '2026-11-01', count: 3, level: 1 },
        { date: '2026-11-02', count: 0, level: 0 },
        { date: '2026-12-03', count: 1234, level: 4 },
      ],
    })
  })

  it('sorts GitHub row-major table cells into chronological days', () => {
    const rowMajorHtml = `
      <td data-date="2026-11-03" id="day-late" data-level="2"></td>
      <tool-tip for="day-late">5 contributions on November 3rd.</tool-tip>
      <td data-date="2026-11-01" id="day-early" data-level="1"></td>
      <tool-tip for="day-early">1 contribution on November 1st.</tool-tip>
    `
    expect(parseContributions(rowMajorHtml)?.days.map((day) => day.date)).toEqual([
      '2026-11-01',
      '2026-11-03',
    ])
  })

  it('returns null when the response has no usable contribution cells', () => {
    expect(parseContributions('<html>temporarily unavailable</html>')).toBeNull()
  })
})

describe('contribution presentation', () => {
  it('formats a hovered day with the same summary structure as the annual total', () => {
    expect(formatContributionDay({ date: '2026-11-06', count: 2, level: 1 })).toBe(
      '2026.11.06 · 2 次贡献',
    )
  })

  it('formats month labels as three-letter English abbreviations', () => {
    expect(formatContributionMonth('2025-11-02')).toBe('Nov')
    expect(formatContributionMonth('2026-01-01')).toBe('Jan')
  })

  it('uses pointer-driven summaries instead of native browser tooltips', () => {
    const source = readFileSync(
      new URL('../src/components/profile/ContributionHeatmap.tsx', import.meta.url),
      'utf8',
    )
    expect(source).toContain('onMouseEnter')
    expect(source).toContain('onMouseLeave')
    expect(source).not.toContain('title={`')
  })
})
