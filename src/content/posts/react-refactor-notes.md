---
title: React 重构笔记
slug: react-refactor-notes
excerpt: 将静态页面重构为 React 组件化结构的过程笔记,涵盖组件拆分、TypeScript 类型约束与 Zustand 状态管理等核心思路。
tags: [React, 前端]
series: 博客改造日志
createdAt: 2025-02-20
---

## 背景介绍

最近把一个静态页面项目重构为 React 组件化结构,借此机会整理一下重构过程中的关键思路。
主要目标是提升代码复用性、降低维护成本,并引入 TypeScript 进行类型约束。

## 重构目标

1. 将重复的 HTML 抽离为可复用组件
2. 引入 TypeScript 进行类型约束
3. 使用 Zustand 管理全局状态
4. 统一样式方案,采用 Tailwind CSS

## 核心代码

下面是一个典型的函数组件写法:

```tsx
interface ButtonProps {
  label: string
  onClick?: () => void
}

function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="px-4 py-2 rounded-md">
      {label}
    </button>
  )
}
```

## 状态管理

使用 Zustand 后,状态管理变得异常简洁:

```ts
import { create } from "zustand"

const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}))
```

## 小结

重构是一场与过去自己的对话,清晰的抽象让代码更易读、更易扩展。

### 收获

- 学会了组件拆分的边界把控
- 体会到 TypeScript 带来的安全感
- 对状态管理有了更深入的理解
