import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { MetricType, ReportOpts } from 'web-vitals'

const LOG_PREFIX = '[web-vitals]'

/** 同一页面只注册一次观察者,避免热更新或重复导入叠多份监听 */
let started = false

function logMetric(metric: MetricType): void {
  console.log(LOG_PREFIX, {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  })
}

/**
 * 采集 LCP / INP / CLS / FCP / TTFB,只打印到浏览器控制台。
 * reportAllChanges:页面仍在前台时就能看到更新,不必切走标签。
 * reportSoftNavs:支持的浏览器里,SPA 跳转会再报一轮(不支持则只报整页加载)。
 */
export function reportWebVitals(): void {
  if (started || typeof window === 'undefined') return
  started = true

  const opts: ReportOpts = { reportAllChanges: true, reportSoftNavs: true }
  onLCP(logMetric, opts)
  onINP(logMetric, opts)
  onCLS(logMetric, opts)
  onFCP(logMetric, opts)
  onTTFB(logMetric, opts)
}
