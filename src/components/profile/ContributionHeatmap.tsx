import { useEffect, useRef, useState } from 'react'
import contributions from 'virtual:github-contributions'
import BlurFade from '@/components/ui/BlurFade'
import {
  formatContributionDay,
  formatContributionMonth,
  type ContributionDay,
} from '@/lib/contributions'
import { createHoverScheduler } from '@/lib/hoverScheduler'

const levelOpacity = [0.06, 0.2, 0.4, 0.65, 0.9]
const HOVER_DELAY = 400

export default function ContributionHeatmap() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoverScheduler] = useState(() => createHoverScheduler(HOVER_DELAY))
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [isSummaryPending, setIsSummaryPending] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (element && window.matchMedia('(max-width: 767px)').matches) {
      element.scrollLeft = element.scrollWidth
    }
    return () => hoverScheduler.cancel()
  }, [hoverScheduler])

  if (!contributions) return null

  const months = contributions.days.reduce<{ label: string; index: number }[]>(
    (result, day, index) => {
      const label = formatContributionMonth(day.date)
      if (result[result.length - 1]?.label !== label) result.push({ label, index })
      return result
    },
    [],
  )
  const first = contributions.days[0]
  const last = contributions.days[contributions.days.length - 1]

  return (
    <BlurFade inView>
      <section className="border-t border-border pt-8 mt-8" aria-labelledby="contribution-title">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-6">
          <h2
            id="contribution-title"
            className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
          >
            贡献 / Contributions
          </h2>
          <p
            className={`min-w-[11rem] min-h-4 text-right font-mono text-xs text-muted-foreground transition-[filter,opacity] duration-150 ${
              isSummaryPending ? 'blur-[4px] opacity-50' : 'blur-0 opacity-100'
            }`}
          >
            {hoveredDay
              ? formatContributionDay(hoveredDay)
              : `过去一年 · ${contributions.total} 次贡献`}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-max pr-1" aria-hidden="true">
            <div
              className="relative h-4 mb-2 font-mono text-[10px] text-muted-foreground"
              style={{ width: `${Math.ceil(contributions.days.length / 7) * 12 - 3}px` }}
            >
              {months.map((month) => (
                <span
                  key={`${month.label}-${month.index}`}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: `${Math.floor(month.index / 7) * 12}px` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateRows: 'repeat(7, 9px)',
                gridAutoFlow: 'column',
                gridAutoColumns: '9px',
              }}
              onMouseLeave={() => {
                hoverScheduler.cancel()
                setIsSummaryPending(false)
                setHoveredDay(null)
              }}
            >
              {contributions.days.map((day) => (
                <span
                  key={day.date}
                  className="size-[9px] rounded-[1px]"
                  style={{ backgroundColor: `rgb(var(--foreground) / ${levelOpacity[day.level]})` }}
                  onMouseEnter={() => {
                    setIsSummaryPending(true)
                    hoverScheduler.schedule(() => {
                      setHoveredDay(day)
                      setIsSummaryPending(false)
                    })
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 mt-2 font-mono text-[10px] text-muted-foreground">
          <p>
            {first.date.replace(/-/g, '.')} — {last.date.replace(/-/g, '.')} · source:{' '}
            <a
              href="https://github.com/ENyerere"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </p>
          <p className="flex items-center gap-1.5">
            less
            {levelOpacity.map((opacity) => (
              <span
                key={opacity}
                className="size-[8px] rounded-[1px]"
                style={{ backgroundColor: `rgb(var(--foreground) / ${opacity})` }}
              />
            ))}
            more
          </p>
        </div>
        <p className="sr-only">
          过去一年共 {contributions.total} 次 GitHub 贡献，统计截至 {last.date}。
        </p>
      </section>
    </BlurFade>
  )
}
