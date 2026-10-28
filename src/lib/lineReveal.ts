/**
 * 逐行揭示(line-reveal)签名动效的运行时行检测。
 *
 * 思路:把标题文本拆成 token(CJK 逐字、拉丁/数字连词、空白独立),
 * 以行内 span 注入后按 offsetTop 分组——offsetTop 相同者即自然换行的同一行;
 * 再按行重建为 .shift-line > span 结构,由 CSS 完成错峰揭示。
 * 分组镜像真实排版,因此宽度不变时重建后的换行与检测完全一致。
 */

const CJK_RE = /[぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/
const WORD_CHAR_RE = /[\w-]/

/** 文本 → token 序列(保留空格,便于还原原始换行) */
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  let buf = ''
  const flush = () => {
    if (buf) {
      tokens.push(buf)
      buf = ''
    }
  }
  for (const ch of text) {
    if (ch === ' ') {
      flush()
      tokens.push(' ')
    } else if (CJK_RE.test(ch) || !WORD_CHAR_RE.test(ch)) {
      // CJK 字符与标点各自独立(标点是潜在换行点)
      flush()
      tokens.push(ch)
    } else {
      buf += ch
    }
  }
  flush()
  return tokens
}

/**
 * 把原始文本重建为逐行包裹结构。
 * 必须传入原始文本:包裹后行与行之间的空格已被裁掉,不能再从 textContent 还原。
 * 宽度变化后可重复调用,按新宽度重新分行。
 */
export function wrapLines(el: HTMLElement, text: string): void {
  if (!text.trim()) return

  // 第一遍:token span 注入,读取自然换行位置
  el.textContent = ''
  const probes: HTMLSpanElement[] = []
  tokenize(text).forEach((token) => {
    const s = document.createElement('span')
    s.textContent = token
    el.appendChild(s)
    probes.push(s)
  })

  // 按 offsetTop 分组
  const lines: string[] = []
  let currentTop = -1
  let current = ''
  probes.forEach((s) => {
    if (s.offsetTop !== currentTop) {
      if (current) lines.push(current)
      current = ''
      currentTop = s.offsetTop
    }
    current += s.textContent ?? ''
  })
  if (current) lines.push(current)

  // 第二遍:重建为 .shift-line > span,--line-number 驱动错峰延迟
  el.textContent = ''
  lines.forEach((lineText, i) => {
    const line = document.createElement('span')
    line.className = 'shift-line'
    line.setAttribute('aria-hidden', 'true')
    const inner = document.createElement('span')
    inner.style.setProperty('--line-number', String(i + 1))
    inner.textContent = lineText.trim()
    line.appendChild(inner)
    el.appendChild(line)
  })
}
