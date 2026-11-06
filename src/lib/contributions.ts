export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionData {
  total: number
  days: ContributionDay[]
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatContributionMonth(date: string): string {
  return monthNames[Number(date.slice(5, 7)) - 1]
}

export function formatContributionDay(day: ContributionDay): string {
  return `${day.date.replace(/-/g, '.')} · ${day.count} 次贡献`
}
