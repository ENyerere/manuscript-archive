import type { ContributionData, ContributionDay } from '../src/lib/contributions'

function attributes(tag: string): Record<string, string> {
  return Object.fromEntries(
    Array.from(tag.matchAll(/([\w-]+)="([^"]*)"/g), (match) => [match[1], match[2]]),
  )
}

/** 解析 GitHub 的公开年度贡献 HTML；页面结构变化或数据不完整时返回 null。 */
export function parseContributions(html: string): ContributionData | null {
  const tooltips = new Map<string, string>()
  for (const match of html.matchAll(/<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const attrs = attributes(match[0])
    if (attrs.for) tooltips.set(attrs.for, match[1])
  }

  const days: ContributionDay[] = []
  for (const match of html.matchAll(/<td\b[^>]*>/g)) {
    const attrs = attributes(match[0])
    const tooltip = attrs.id ? tooltips.get(attrs.id) : undefined
    if (!attrs['data-date'] || !tooltip) continue
    const count = tooltip.startsWith('No contributions')
      ? 0
      : Number(tooltip.match(/[\d,]+/)?.[0].replaceAll(',', ''))
    const level = Number(attrs['data-level'])
    if (!Number.isFinite(count) || ![0, 1, 2, 3, 4].includes(level)) return null
    days.push({
      date: attrs['data-date'],
      count,
      level: level as ContributionDay['level'],
    })
  }

  if (days.length === 0) return null
  // GitHub 表格按星期逐行输出（所有周日、所有周一……），渲染前必须恢复时间顺序。
  days.sort((a, b) => a.date.localeCompare(b.date))
  return {
    total: days.reduce((sum, day) => sum + day.count, 0),
    days,
  }
}
