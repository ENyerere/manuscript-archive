# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

中文读者,对前端开发、技术笔记、个人随笔感兴趣。他们通常在桌面端或移动端长时间停留阅读文章,期待安静的阅读环境,不希望被装饰元素干扰。读者可能是同行开发者、学生或技术爱好者,重视作者的独立声音而非通用教程站。

## Product Purpose

这是一个个人博客,用于发布技术笔记、项目总结与个人随笔。它提供清晰的文章归档与标签检索,展示作者身份与作品。成功标准:读者能专注阅读完整文章,并通过归档/标签自然发现更多内容;作者能以最低成本持续发布,无需维护复杂系统。

## Positioning

独立中文个人博客,以「手稿/档案」气质与排版纪律区分于通用教程站、SaaS 风模板与终端黑客风博客;不靠功能堆砌,靠克制的视觉语言与作者声音立足。(推断,由 init 依据 Brand Personality 与 Anti-references 补全,待作者确认)

## Operating Context

- 阅读场景:桌面端与移动端并存,长文阅读为主;iOS Safari 是重要且已踩过坑的平台(View Transitions 需禁用,降级方案详见 DESIGN.md)。
- 部署形态:静态站点,双端发布——主站 https://yshenyi.ink/(阿里云 + Caddy,已 ICP 备案)与 GitHub Pages 镜像 https://enyerere.github.io/manuscript-archive/;push main 即经 CI 构建同步,另每周一 03:17 UTC 定时重建刷新关于页 GitHub 数据。
- 写作流程:文章即 `.md` 文件,写作即提交,构建期渲染为静态页。

## Capabilities and Constraints

已上线能力:

- 全文检索(标题/摘要/标签/正文,`/` 唤起,正文索引首次检索时才下载)与标签过滤(白名单制,bracket 约定,`?q=` / `?tag=` 入 URL 可恢复)
- 文章归档(按年时间线 + 篇数统计)、标签页、系列文章(front matter `series` 字段 + 合集页 + 系列感知前后篇导航)
- RSS 2.0(构建期生成 feed.xml,最新 20 篇全文)、文章 git 版本链(元数据块短 hash 链 GitHub 历史)
- 关于页 GitHub 数据构建期注入(项目策展 `src/data/projects.ts`、语言占比按非 fork 仓库 Linguist 字节聚合、技能方向人工策展,API 失败降级不中断构建)
- 按路由静态页(独立 title/description/OG/canonical,`<noscript>` 含正文,软 404 注入 noindex)、亮暗主题(theme-reveal 圆形扩散,iOS 走遮罩擦除降级)

约束:

- 无后端、无数据库,一切数据构建期生成;维护成本必须趋近于零
- 明确不做:评论区(引入第三方或后端,违背最低维护成本)、点赞/浏览量(无后端且与手稿气质不符)、AI 摘要(内容应由作者声音承载)
- 标签白名单:文章 tags 只允许使用 `src/data/tags.ts` 中登记的值,构建期校验,清单外直接报错;新增标签先登记再使用,同义就近归并,每篇 2~3 个

## Brand Commitments

手稿感、档案化、精确。这个博客不是"网站",而是一叠被持续修订的手稿:每篇文章是一个有版本、有元数据、被认真归档的文档artifact。视觉语言来自纯文本世界——等宽字体、YAML front matter、细线、留白的纸面——而非来自 UI 组件库。技术感不靠霓虹与终端绿表达,而靠排版的纪律性表达:对齐、字距、行高、分隔线,全部有据可依。

3 词:manuscript, archival, precise

反参照(绝不成为):

- **圆角卡片网格**(旧版自身):卡片套卡片、大圆角、色块堆叠——手稿没有卡片,只有纸面与分隔线
- **SaaS 落地页**:满屏卡片、彩色渐变、营销话术——博客不卖东西
- **终端黑客风**:深色高对比、霓虹绿、扫描线——技术感由排版纪律表达,不靠 COS 终端
- **活泼装饰**:满屏 emoji、表情包、插画贴纸——装饰不应抢内容主角
- **论坛社区**:密集信息、复杂侧边栏、楼层式排版——博客不是讨论区

## Evidence on Hand

- 无站点分析工具、无读者反馈渠道;体验证据来自作者本人使用与自评。(推断,由 init 依据无后端静态架构补全,待作者确认)
- 一次 design 评审(2026-07,30/40)与一次文章页 audit(2026-10-31,18/20 Excellent),结论与修复记录留在 git 历史。

## Product Principles

1. **内容为王**:设计服务于阅读,排版、色彩、动画都为让读者专注于文字而存在,不抢内容主角
2. **文章即手稿**:每篇文章视为一份带元数据(YAML 式)、有版本历史的归档文档,而非信息流里的一条"内容"
3. **单色即态度**:不使用任何主题色相。墨(ink)与纸(paper)的对比驱动全部信息层级;链接靠下划线而非颜色识别
4. **细线取代容器**:用 1px hairline 分隔与组织内容,不用卡片背景、阴影、圆角堆叠来制造层次
5. **动画服务于流畅**:签名动效只有一种——标题的逐行揭示;其余动效一律克制(透明度、小位移),每个动画都应有明确目的
6. **静默的可访问性**:无障碍作为基线工程实践,不作为特殊处理或额外功能宣传
7. **组件优先**:优先复用成熟组件库(shadcn/ui)而非从零实现,但组件外观必须服从本设计系统

## Accessibility & Inclusion

- 正文与标题对比度 ≥4.5:1(ink/paper 天然满足),大字 ≥3:1
- **静音文字刻意低于 AA**:ink-3(亮色 `#999999` / 暗色 `#737373`)对比度约 2.7–3:1,仅用于元数据、标签、辅助说明等非关键信息——这是「静音」气质的明确取舍,关键信息与可操作元素不使用 muted 色
- 完整支持 `prefers-reduced-motion`(降级规则见 DESIGN.md)
- 语义化 HTML、键盘可达、focus 态可见(`outline` 单色,不依赖颜色单独传达信息)
- 过滤器的激活态除 bracket 外同步 `aria-pressed`;TOC 当前章节 `aria-current`;主题按钮 `aria-pressed`

视觉系统(色彩/字体/布局/动效/组件约定)已迁移至 DESIGN.md;设计令牌与规范以该文件为准。

## Deployment

- **主站**:https://yshenyi.ink/ (阿里云 + Caddy,HTTPS,页脚展示 ICP 备案号);push main 经 `.github/workflows/deploy-server.yml` 构建并同步到服务器。Caddy `try_files {path}.html {path} /index.html` 优先命中静态页;静态资源长缓存,HTML no-cache
- **镜像**:GitHub Pages,https://enyerere.github.io/manuscript-archive/ (`.github/workflows/deploy.yml`)
- **双端变量**:`VITE_BASE` 控制路径前缀(Pages `/manuscript-archive/`,主站 `/`);`SITE_URL` 控制绝对地址,sitemap.xml / feed.xml / robots.txt 构建期一律按它生成——写死域名的文件不进 `public/`
- **子路径**:Pages 构建注入 `VITE_BASE=/manuscript-archive/`;本地预览保持根路径。`index.html` 中的静态资源引用(favicon、manifest、feed)一律用 `%BASE_URL%` 前缀(构建期替换为部署根路径)——不写死 github.io 绝对地址,否则自有服务器主站会跨域回源到镜像;运行时资源用 `import.meta.env.BASE_URL` 或 `import` 引入
- **按路由静态页**:构建期为文章/标签/系列/归档/关于生成 `posts/<slug>.html` 等扁平文件(独立 title、description、OG、canonical,`<noscript>` 内含正文或文章列表),Pages 与 Caddy(`try_files {path}.html`)直接命中;不做 SSR 注水,加载后仍由 SPA 接管
- **SPA 深链接兜底**:`public/404.html` 编码 + `index.html` 解码脚本回退;`pathSegmentsToKeep` 构建期按 base 段数自动改写;路由 `basename` 取 `BASE_URL`
- **正文管线**:Markdown 在构建期渲染为 HTML(`build/markdown.ts`,含代码高亮与标题锚点),客户端不再携带 Markdown 解析器;正文按篇拆 chunk,检索正文索引首次检索时才下载
- **构建期注入**:文章 git 版本(virtual:post-revisions,checkout 需 `fetch-depth: 0`)、`dist/feed.xml`(RSS 2.0,最新 20 篇已发布文章,`content:encoded` 输出全文)、GitHub 活数据(virtual:github-projects / virtual:github-languages,API 失败降级为配置信息,构建不中断)
- **定时重建**:每周一 03:17 UTC 触发,刷新关于页的 GitHub 项目与语言数据,无需 push 代码
- **软 404 治理**:静态托管对无效路径恒返回 200;404 分支(NotFound / 无效标签 / 无效文章 / 无效系列)渲染时注入 `<meta name="robots" content="noindex, nofollow">`(`useNoIndex`),离开页面自动移除
- **韧性约定**:`index.html` 内联脚本在首帧绘制前按 localStorage / 系统偏好加 dark class,防深色用户闪白;带 hash 的 chunk 加载失败自动刷新一次(`chunkReload`),仍失败显示 RouteError 页

### 关于页 GitHub 数据约定

- **项目策展**:展示名单维护在 `src/data/projects.ts`(`repo` + 可选中文描述覆盖);语言/star/更新时间/链接构建期自动补齐;fork 不入名单;star 为 0 不展示
- **语言占比**:聚合全部**非 fork** 仓库的 Linguist 字节数,Top 6 + 「其他」;口径明确标注「按 GitHub 代码量」——它反映编码活动而非熟练度;API 不可用时回退 `fallbackLanguages` 手写清单
- **技能方向**:语言之外的能力维度(如软件测试)人工策展于 `disciplines`,与语言区分离

## Migration Notes

迁移已于 2026-07 完成并上线,过程记录保留在 git 历史与「博客改造日志」系列文章中,本节不再维护。
