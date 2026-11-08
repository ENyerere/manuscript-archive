/** RSS 全文:把站内相对链接改写为绝对地址;]]> 拆开避免提前闭合 CDATA。 */
export function feedHtml(html: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const absolute = html
    .replace(/(href|src)="\.\.\//g, `$1="${base}/`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
  return `<![CDATA[${absolute.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}
