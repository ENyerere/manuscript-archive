---
title: 重构记:构建期渲染与轻量化
slug: blog-perf-refactor
excerpt: 博客改造日志其四。Markdown 挪到构建期渲染,文章页 JS 从 344KB 瘦到 8.5KB;RSS 升级全文输出,还顺手修好了 GitHub Pages 镜像的路由。
tags: [博客, 性能, 前端]
series: 博客改造日志
createdAt: 2026-10-27
---

## 起因:主包越来越重

手稿档案的气质是「轻」,但代码越来越不轻。审查依赖时发现,浏览器里一直背着
一整套 Markdown 解析器(`react-markdown` + `highlight.js`)、三个 Radix 组件、
一个动画库,还有 66 个字体文件——其中大部分子集(cyrillic、greek、vietnamese)
这个中文博客根本用不到。

于是做了一次彻底的轻量化 + 构建期渲染重构。

## 构建期渲染:Markdown 不进浏览器

核心改动:Markdown 在构建时直接转成 HTML(`build/markdown.ts`),客户端不再
携带解析器。每篇文章、标签、系列、归档、关于页都会预生成一份独立的静态 HTML,
各自带标题、描述和 OG 分享信息;`<noscript>` 里放着正文或文章列表,
不执行 JS 的爬虫(比如百度)也能读到完整内容。

文章正文还按篇拆成了独立 chunk,每篇只有 1–3KB,访问哪篇加载哪篇。

## 减重清单

数字比描述更直观:

| 产物 | 优化前 | 优化后 |
|---|---|---|
| 文章页 chunk | 344KB | 8.5KB |
| CSS | 86KB | 24KB |
| 字体文件 | 66 个 | 4 个 |
| 头像 | 228KB JPG | 2KB / 7KB WebP |

具体做了这些:Roboto 和 Font Awesome 整个移除;`framer-motion` 和三个
Radix 组件卸载,桌面导航回归普通 `<nav>`——这套设计本来就靠 hairline 和
字重说话,不需要组件库的惯性;字体只保留 JetBrains Mono 的 latin 子集;
头像转成 WebP,按 1x / 2x 提供两档。

## 顺手修好的:Pages 镜像一直是坏的

排查中发现一个存在已久的 bug:GitHub Pages 镜像站路由没设 `basename`,
`404.html` 里的 `pathSegmentsToKeep` 也不对,导致 `/manuscript-archive/` 下的
任何路由都匹配不上——镜像站其实是瘫痪的,只是没人报告。

现在 `basename` 取自构建时的 `BASE_URL`,`pathSegmentsToKeep` 按部署路径
自动改写,子路径部署不再需要手工同步配置。

## 小功能

- **代码块复制**:右上角一个低调的 `copy` 按钮,点击后短暂变为已复制状态
- **图片懒加载**:文章里的图进入视口才加载
- **RSS 全文**:`feed.xml` 从摘要升级为全文输出,阅读器里直接读完整文章
- **滚动与标题**:跳转新页面回到顶部、后退恢复原位;每个页面有独立的
  `document.title`,标签页不再千篇一律
- **搜索优化**:结果做了缓存,正文检索索引延迟到第一次聚焦搜索框时才下载

## 一点取舍

有两个行为变化值得记录:开发模式下改文章会整页刷新,不再是热更新
(构建期渲染的代价,可接受);未发布的草稿不再生成正文 chunk,
草稿内容不会进入产物——这其实是更安全的默认行为。

重构结束后,主包从 326KB 降到 296KB,剩下的大头是 React 和 React Router 本身。
手稿的「轻」,这次从视觉贯彻到了字节。
