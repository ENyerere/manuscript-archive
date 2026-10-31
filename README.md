# 小峄热心市民

个人博客——技术笔记、项目总结与个人随笔。线上:<https://yshenyi.ink/>

- 技术栈:React 18 + TypeScript + Vite + React Router 7 + Tailwind CSS + Zustand(少量 shadcn/ui 组件,皮肤按设计系统重写)
- 设计文档:见 [PRODUCT.md](PRODUCT.md)(「手稿档案」风格:单色 ink/paper、hairline、YAML 元数据块)

## 常用命令

```bash
npm run dev      # 开发服务器
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
```

## 写作指南

文章存放在 `src/content/posts/*.md`,**写作即提交**:新增一个 `.md` 文件并提交,构建后自动上线,无需改动任何代码。

文件开头是 front matter(YAML 子集),空一行后是 Markdown 正文:

```markdown
---
title: 文章标题            # 必填
slug: my-post             # 可选,默认取文件名(不含 .md)
excerpt: 一句话摘要       # 可选,用于列表页与订阅源
tags: [随笔, 个人]        # 可选,仅限白名单(见下)
createdAt: 2025-03-15     # 必填,YYYY-MM-DD
updatedAt: 2025-03-20     # 可选,默认等于 createdAt
published: false          # 可选,默认 true;false 时为草稿不上线
series: 博客改造日志      # 可选,所属系列名;同系列文章自动串联并生成 /series/ 合集页
---

正文从这里开始。注意:**正文不要重复写一级标题**,
页面标题由 front matter 的 title 渲染;章节从 `##` 开始。
```

约定:

- 正文章节标题从 `##`(h2)开始,h2/h3 会自动生成锚点并进入目录
- 文件名即默认 slug,建议用英文小写加连字符,如 `react-refactor-notes.md`
- **标签白名单**:`tags` 只能使用 `src/data/tags.ts` 中已登记的值,清单外标签会让**构建直接失败**;新增标签先登记,同义就近归并,每篇 2~3 个
- 草稿(`published: false`)不会出现在任何列表、路由与订阅源中

## 构建产物

`npm run build` 除 SPA 外还生成:

- 逐路由静态页(独立 title / OG / canonical,`<noscript>` 含正文或列表,利于收录)
- `feed.xml`(RSS 2.0,全文输出,最新 20 篇已发布文章)+ `rss.xsl` 浏览器样式
- `sitemap.xml` 与 `robots.txt`(按部署端 `SITE_URL` 生成,双端域名各自正确)

## 部署

push main 触发双路部署(GitHub Actions):

- **主站** <https://yshenyi.ink/> —— 阿里云 + Caddy(`.github/workflows/deploy-server.yml`)
- **镜像** <https://enyerere.github.io/manuscript-archive/> —— GitHub Pages(`.github/workflows/deploy.yml`)

每周一 03:17 UTC 定时重建,刷新关于页的 GitHub 项目与语言数据,无需 push 代码。
