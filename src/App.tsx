import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/routes/HomePage'
import { loadPostBody } from '@/content/posts'

// 路由级代码分割:使用 React Router 的 route.lazy 而非 React.lazy + Suspense。
// 关键差异:route.lazy 导航期间保留旧页面渲染,模块就绪后再切换,
// 不存在"加载中…"兜底 UI 出场的机会,从机制上消除闪屏。
const loadPostPage = () => import('@/routes/PostPage')
// 模块求值即预热文章页 chunk:与主包并行下载,用户进站后首次点击文章时通常已就绪
void loadPostPage()

/** route.lazy 适配器:把默认导出的页面组件包成 { Component } 形态 */
const lazyRoute = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await loader()).default,
})

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: 'posts/:slug',
          // 正文 chunk 与页面 chunk 并行加载,都就绪后才切换页面(同样不闪屏)
          loader: ({ params }) => (params.slug ? loadPostBody(params.slug) : null),
          lazy: lazyRoute(loadPostPage),
        },
        { path: 'archives', lazy: lazyRoute(() => import('@/routes/ArchivesPage')) },
        { path: 'tags', lazy: lazyRoute(() => import('@/routes/TagsPage')) },
        { path: 'tags/:tag', lazy: lazyRoute(() => import('@/routes/TagPage')) },
        { path: 'series/:name', lazy: lazyRoute(() => import('@/routes/SeriesPage')) },
        { path: 'about', lazy: lazyRoute(() => import('@/routes/AboutPage')) },
        { path: '*', lazy: lazyRoute(() => import('@/routes/NotFoundPage')) },
      ],
    },
  ],
  // GitHub Pages 部署在 /manuscript-archive/ 子路径,路由需以部署根为基准
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export default function App() {
  return <RouterProvider router={router} />
}
