---
name: 小峄热心市民 · Manuscript Archive
description: 手稿档案气质的单色个人博客——墨与纸的对比驱动全部信息层级
colors:
  paper: "#fafafa"
  ink: "#0a0a0a"
  ink-2: "#3d3d3d"
  ink-3: "#999999"
  line: "#e5e5e5"
  paper-2: "#f2f2f2"
  codeblock-bg: "#141414"
  destructive: "#be3a32"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', sans-serif"
    fontWeight: 700
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', sans-serif"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', monospace"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.08em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', monospace"
    fontFeature: "'calt' 1, 'liga' 1"
rounded:
  sm: "2px"
spacing:
  container-gutter: "24px"
  entry-padding: "24px"
  section-gap: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
---

# Design System: 小峄热心市民 · Manuscript Archive

## Overview

**Creative North Star: "The Manuscript Archive（手稿档案）"**

这个博客不是"网站",而是一叠被持续修订的手稿:每篇文章是一个有版本、有元数据、被认真归档的文档。视觉语言来自纯文本世界——等宽字体、YAML front matter、细线、留白的纸面——而非来自 UI 组件库。技术感不靠霓虹与终端绿表达,而靠排版的纪律性表达:对齐、字距、行高、分隔线,全部有据可依。

明暗主题互为严格反转,共用一套语义命名;信息层级完全由墨(ink)与纸(paper)的明度对比、字重与留白驱动。动效克制到只剩两种签名:文章标题的逐行揭示(内容入场)与主题切换的圆形扩散(全局状态反转)——墨晕于纸,暗合手稿隐喻。

**Key Characteristics:**
- 纯单色双色系统,全站无主题色相;链接靠下划线而非颜色识别
- 1px hairline 取代卡片、阴影与圆角堆叠来组织内容
- 双轨字体:JetBrains Mono 驱动元数据与界面,系统黑体驱动正文阅读
- 签名元素:YAML 元数据块、bracket 过滤器(`> 前端 <`)、页脚墨色反转"卷末"
- 平面无阴影、无渐变、无玻璃拟态;层次仅由 hairline 与留白构成

## Colors

墨色阶梯:从纸面到墨的黑白纸系,明暗主题严格反转。

### Neutral

- **Paper 纸面** (#fafafa):页面背景。不是纯白——保留一丝暖灰,像未漂白的纸。
- **Ink 墨色** (#0a0a0a):正文与标题文字、按钮底色、页脚反转块底色。不是纯黑——是落墨的浓。
- **Ink-2 墨二** (#3d3d3d):次要文字——摘要、正文辅助说明。
- **Ink-3 静音灰** (#999999):元数据、标签、辅助说明等"静音"信息。对比度刻意低于 AA(约 2.7–3:1),这是"静音"气质的明确取舍;关键信息与可操作元素不使用此色。
- **Hairline 细线** (#e5e5e5):1px 分隔线与边框,全站唯一的"容器"。
- **Paper-2 纸二** (#f2f2f2):极浅层次——引用块底色、按钮常态底。
- **Codeblock 代码底** (#141414):代码块背景,明暗主题下均为深色(代码属于"墨"的世界)。
- **Destructive 单色红** (#be3a32):唯一功能色例外,仅危险操作。

### Named Rules

**The No-Accent Rule(无主题色规则).** 全站不存在"主题色"。可交互元素的识别方式是下划线、字重变化、bracket 符号,永远不是颜色。代码语法高亮是唯一多色区域,且必须低饱和、明度阶梯与灰阶一致。

**The Strict Inversion Rule(严格反转规则).** 暗色主题不是另一套配色,而是同一套语义的反转:paper ↔ ink 互换,hairline 用 #262626 保持可辨,代码块保持深色不变。新增颜色必须同时定义明暗两值。

**The Muted-With-Intent Rule(刻意静音规则).** ink-3 低于 AA 是刻意的,只许用在元数据与辅助说明;任何承载关键信息或可操作的元素不得使用 muted 色。

## Typography

**Display/Body Font:** 系统黑体(-apple-system / PingFang SC / Microsoft YaHei)——中文阅读质量与零加载成本是硬约束
**Label/Mono Font:** JetBrains Mono(启用 calt/liga 连字)——元数据、UI、标签、代码;中文混排时 CJK 自动回落系统黑体

**Character:** 等宽字体负责"档案感"(日期、字数、版本号、标签),人文无衬线负责"阅读感"。中文标题不斜体——中文无真斜体,层级靠字重与字号区分。

### Hierarchy

- **Display** (700, 字距 -0.03em):页脚超大联系排版(4xl–6xl)、文章页 H1。H1 入场配逐行揭示动画(1400ms,cubic-bezier(0.19,1,0.22,1),逐行错峰 140ms)。
- **Headline** (600, 字距 -0.015em):章节标题、页面标题。
- **Title** (继承正文字号,不过度加粗):文章列表条目标题——手稿目录里标题不需要喊。
- **Body** (400, 18px 桌面 / 16px 移动, 行高 1.75, measure ≈ 68ch):长文阅读。
- **Label** (JetBrains Mono, 12px, 600, 字距 0.08em):拉丁小标签可 uppercase;中文标签用同字号 + 字重 500,不强行大写。
- **Metadata** (JetBrains Mono):YAML 元数据块的标签名固定宽度约 6em,值内联同行:`date: 2026-10-31` / `rev: 7cfaf82`。

### Named Rules

**The Two-Track Rule(双轨规则).** 等宽与非等宽各司其职:凡是"关于文档的信息"(元数据、时间、计数、版本)用 Mono;凡是"被阅读的内容"(标题、正文)用系统黑体。不混用,不引入第三种字体。

**The No-Italic-CJK Rule(中文不斜体规则).** 强调靠字重,不靠斜体;衬线中文正文已被否决(旧版验证破坏长文阅读)。

## Layout

纸面 + hairline 的编辑性布局,告别卡片网格。

- **页面骨架**:页头左站点名、右导航,下方一条 hairline;sticky 时背景实色 paper(不用毛玻璃)。索引页页头下可加一条 3px 墨粗规则线作全站签名分隔(文章页省略)。容器最大宽度 72rem,页边距 24px(移动)/32px(桌面)。
- **索引页**:大留白(纵向 padding 6–8rem 量级)。文章列表无卡片:每篇一行条目,条目结构 = 左侧等宽日期栏(YYYY-MM-DD,固定宽度)+ 标题 + 静音摘要,条目间 hairline 分隔(padding 24px)。桌面端允许奇数条目右移 ≤2rem 的错落,呼应"散落手稿",移动端取消错落。
- **文章页**:单栏居中阅读栏(measure ≈ 68ch);头部顺序:标题(逐行揭示)→ YAML 元数据块 → hairline → 正文。右栏 TOC 在 xl 断点(1280px)出现,hairline 风格,当前章节用字重 + 左侧短粗线指示。上一篇/下一篇为 hairline 分隔的文字链接行。
- **页脚**:反转为墨色块(ink 底 paper 字),超大联系排版收尾,形成明确的"卷末"感。
- **移动端**:单栏,元数据栏折行到标题上方;桌面 TOC 改为正文前折叠目录(+ / × 约定,点节标题跳转后自动收起);页头导航折叠为汉堡按钮,点击展开全屏索引页(非抽屉):整页覆盖,大字号序号目录(01–04,hairline 分隔),300ms 淡入 + 目录行 70ms 错峰上浮,300ms 淡出卸载,Esc 可关,打开时锁定背景滚动。
- **视口稳定**:html 始终显示纵向滚动条(8px 单色自绘),短页与长页切换时视口宽度恒定,消除布局横移。

## Elevation & Depth

本系统完全平面:无阴影、无渐变、无玻璃拟态、无模糊背景。深度仅由三种手段传达——hairline 分隔、留白节奏、墨色反转(页脚/选中态/暗色主题)。

### Named Rules

**The Flat-By-Default Rule(平面默认规则).** 任何元素默认无阴影。如果需要"浮起"的感觉,先问能不能用 hairline 或留白解决;阴影在本系统中没有合法席位。

**The Hairline-Is-The-Container Rule(细线即容器规则).** 分隔内容用 1px line 色细线,不用卡片背景、不用色块堆叠、不用圆角分组。全站唯一的"厚"线是索引页页头下 3px 墨规则线——它是签名,不是容器。

## Shapes

形式语言是"纸的直角":圆角从无到 2px 封顶(--radius: 2px),绝大多数元素(条目、元数据块、代码块、输入框)为纯直角。2px 只用于需要可点击暗示的按钮。边框一律 1px hairline。选中文本用墨纸反转(::selection:ink 底 paper 字),不用彩色高亮。

## Components

### Buttons
- **Shape:** 直角至微圆角(≤2px)
- **Primary:** 墨底纸字(ink 底 / paper 字),padding 8px 16px,单色,无阴影
- **Hover / Focus:** hover 底色淡至 ink-2;focus 用单色 outline 环(ring 取 ink),不依赖颜色单独传达
- **Ghost / 文字按钮:** 纯文字 + hover 下划线(见 Text Links)

### Text Links
- **Style:** 继承 ink,常显下划线(offset 3px)
- **Hover:** 页脚/社交链接用下划线生长动画(.u-line):2px 线段从左到右 scaleX 生长(200ms);线高必须 2px——1px 在半像素对齐时会被抗锯齿拆淡

### Filter Chips(过滤器约定)
- **Style:** 纯文字按钮,无底色、无边框、无 Badge 色块
- **Active:** 用 bracket 符号包裹——`> 前端 <`(::before/::after 注入),同步 aria-pressed;不靠颜色区分
- **Filtering:** 未命中条目衰减至 opacity 0.3(不移除、不重排,300ms)

### YAML Metadata Block(签名组件)
- **Style:** 文章头部元信息以 front-matter 形式排布:标签名等宽、固定宽度约 6em(flex-shrink: 0),值内联同行
- **Content:** date / tags / series(第 N / M 篇)/ words / time / rev(git 短 hash,链接到提交历史)

### Inputs / Search
- **Style:** 无线框,仅 1px hairline 底线,mono 字体,背景透明
- **Focus:** 底线加深(ink);`/` 快捷键聚焦,Esc 清空;检索词与标签过滤叠加并写入 ?q= / ?tag=

### Code Blocks
- **Style:** 始终深色底(codeblock-bg #141414,明暗主题一致),JetBrains Mono,直角
- **Syntax:** 单色阶梯推导的低饱和配色;右上角文字 copy 按钮
- **行内 code:** paper-2 底色,mono

### Navigation
- **Style:** 桌面端 4 个平级文字链接,语义化 `<nav>`;当前页下划线 + 字重区分
- **Mobile:** 汉堡按钮 → 全屏索引页(序号 01–04 大字号目录,hairline 分隔,当前页下划线 +「当前」标记,顶行 索引 / INDEX + × 关闭,底部卷末标记)

### Footer(卷末)
- **Style:** 整页唯一大面积色块:ink 底 paper 字的反转;超大字号(Display)署名 + 文字社交链接(u-line 下划线生长)+ RSS;底部 hairline(border-background/20)上版权行与 ICP 备案号

### Theme Toggle(签名动效)
- **桌面/现代浏览器:** 新主题快照以 clip-path: circle() 从点击位置扩散覆盖全屏(500ms, ease-in-out,View Transitions API)
- **降级:** iOS WebKit / 不支持 View Transitions → 单元素遮罩擦除(.theme-wipe:目标主题色全屏遮罩 150ms 淡入 → 遮罩下主题瞬时翻转 → 220ms 淡出);不要回退到全 DOM 逐元素颜色渐变(iOS 会分批调度导致文字变色撕裂)
- **reduced-motion:** 纯瞬时切换

## Do's and Don'ts

### Do:
- **Do** 用 hairline(1px, line 色)分隔一切内容区块;需要更强分隔时优先加大留白,而不是加粗线(3px 墨线仅限索引页签名位)
- **Do** 元数据一律 JetBrains Mono,标签名固定宽度约 6em,保持 YAML 块的对齐纪律
- **Do** 新增颜色时同时定义明暗两值,并保持"暗色 = 严格反转"的语义
- **Do** 交互反馈用下划线生长、字重变化、bracket 符号、opacity 衰减——单色工具箱已经够用
- **Do** 动效保持克制:入场 opacity + translateY(8px) 错峰(400ms),过滤衰减 300ms,下划线生长 200ms;每个动画都要有明确目的
- **Do** iOS 上禁用 View Transitions,用 .theme-wipe 单元素遮罩擦除做降级补偿

### Don't:
- **Don't** 使用任何主题色相、彩色渐变、玻璃拟态或阴影——没有例外区域(代码语法高亮除外,且必须低饱和)
- **Don't** 引入卡片:不用背景色块、圆角容器、阴影分组来组织列表或内容
- **Don't** 用颜色单独传达状态(链接、激活态、错误);必须配下划线/字重/符号/文字
- **Don't** 给中文标题用斜体,或给中文标签强行 uppercase
- **Don't** 给关键信息或可操作元素使用 ink-3 静音色(它低于 AA 是刻意取舍,仅限元数据)
- **Don't** 新增签名动效;逐行揭示与主题扩散之外,动效一律次级规格
