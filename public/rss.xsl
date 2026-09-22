<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="rss/channel/title"/> · RSS</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #fafafa;
            color: #0a0a0a;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
            line-height: 1.7;
            padding: 4rem 1.5rem 6rem;
          }
          .page { max-width: 640px; margin: 0 auto; }
          .mono {
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          }
          .kicker {
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            color: #999;
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0.5rem 0 0.25rem;
          }
          .site-desc { color: #999; font-size: 0.95rem; }

          .rule {
            border: none;
            border-top: 3px solid #0a0a0a;
            margin: 2rem 0;
          }
          .hairline {
            border: none;
            border-top: 1px solid #e5e5e5;
          }

          .about {
            border-top: 1px solid #0a0a0a;
            border-bottom: 1px solid #0a0a0a;
            padding: 1.5rem 0;
            margin-bottom: 3rem;
          }
          .about h2 { font-size: 1.05rem; margin-bottom: 0.75rem; }
          .about p { font-size: 0.92rem; color: #444; margin-bottom: 0.75rem; }
          .about .feed-url {
            display: block;
            background: #f0f0ee;
            border: 1px solid #e5e5e5;
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
            word-break: break-all;
            user-select: all;
            margin: 0.75rem 0;
          }
          .about ul { list-style: none; font-size: 0.92rem; color: #444; }
          .about li { padding: 0.15rem 0; }
          .about li::before { content: "· "; color: #999; }

          .item { padding: 1.5rem 0; }
          .item .date {
            font-size: 0.8rem;
            color: #999;
            letter-spacing: 0.05em;
          }
          .item h3 {
            font-size: 1.15rem;
            font-weight: 600;
            margin: 0.35rem 0;
          }
          .item h3 a { color: #0a0a0a; text-decoration: none; }
          .item h3 a:hover { text-decoration: underline; text-underline-offset: 4px; }
          .item .excerpt { font-size: 0.92rem; color: #666; }
          .item .tags { margin-top: 0.5rem; font-size: 0.8rem; color: #999; }

          footer {
            margin-top: 4rem;
            padding-top: 1.5rem;
            font-size: 0.8rem;
            color: #999;
          }
          footer a { color: #0a0a0a; }
        </style>
      </head>
      <body>
        <div class="page">
          <header>
            <div class="kicker mono">RSS FEED · 订阅源</div>
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="site-desc"><xsl:value-of select="rss/channel/description"/></p>
          </header>

          <hr class="rule"/>

          <section class="about">
            <h2>这是什么？</h2>
            <p>这是本站的 RSS 订阅源——一份自动更新的文章清单。它不是给浏览器直接阅读的页面，而是配合 RSS 阅读器使用的。</p>
            <p>把下面这个地址复制到任意 RSS 阅读器（如 Follow、Feedly、Inoreader、NetNewsWire）中，之后每有新文章发布，阅读器会自动提醒你：</p>
            <span class="feed-url mono"><xsl:value-of select="rss/channel/atom:link/@href"/></span>
            <h2>如何使用</h2>
            <ul>
              <li>安装任意一款 RSS 阅读器 App 或打开其网页版</li>
              <li>选择「添加订阅 / Add Feed」</li>
              <li>粘贴上方地址，确认即可</li>
            </ul>
          </section>

          <div class="kicker mono" style="margin-bottom: 0.5rem;">最新文章</div>
          <hr class="hairline"/>

          <xsl:for-each select="rss/channel/item">
            <article class="item">
              <div class="date mono"><xsl:value-of select="substring(pubDate, 6, 11)"/></div>
              <h3>
                <a>
                  <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h3>
              <p class="excerpt"><xsl:value-of select="description"/></p>
              <xsl:if test="category">
                <div class="tags mono">
                  <xsl:for-each select="category">
                    <xsl:text>&gt; </xsl:text><xsl:value-of select="."/><xsl:text> &lt;&#160;&#160;</xsl:text>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </article>
            <hr class="hairline"/>
          </xsl:for-each>

          <footer>
            <hr class="hairline" style="margin-bottom: 1.5rem;"/>
            <span class="mono">END OF FEED · 卷末 — </span>
            <a>
              <xsl:attribute name="href"><xsl:value-of select="rss/channel/link"/></xsl:attribute>
              返回本站首页
            </a>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
