export interface HoverScheduler {
  schedule: (callback: () => void) => void
  cancel: () => void
}

/** 共享一个延迟任务：新悬停会取代旧悬停，移出时可取消未提交的任务。 */
export function createHoverScheduler(delay: number): HoverScheduler {
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  return {
    schedule(callback) {
      cancel()
      timer = setTimeout(() => {
        timer = undefined
        callback()
      }, delay)
    },
    cancel,
  }
}
