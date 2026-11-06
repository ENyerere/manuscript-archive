import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/routes/HomePage'
import ArchivesPage from '@/routes/ArchivesPage'
import TagsPage from '@/routes/TagsPage'
import AboutPage from '@/routes/AboutPage'
import { loadPostBody } from '@/content/posts'
import RouteError from '@/routes/RouteError'

// 四个核心导航页面随主包加载,避免无缓存首次切换时等待极小的页面 chunk。
// 文章与次级页面仍用 route.lazy:导航期间保留旧页面,模块就绪后再切换,
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
      // Layout 自身出错时的兜底(此时没有页头页脚)
      errorElement: <RouteError />,
      children: [
        {
          // 无路径包裹层:页面级错误渲染在 Layout 的 Outlet 内,保留页头页脚
          errorElement: <RouteError />,
          children: [
            { index: true, element: <HomePage /> },
            {
              path: 'posts/:slug',
              // 正文 chunk 与页面 chunk 并行加载,都就绪后才切换页面(同样不闪屏)
              loader: ({ params }) => (params.slug ? loadPostBody(params.slug) : null),
              lazy: lazyRoute(loadPostPage),
            },
            { path: 'archives', element: <ArchivesPage /> },
            { path: 'tags', element: <TagsPage /> },
            { path: 'tags/:tag', lazy: lazyRoute(() => import('@/routes/TagPage')) },
            { path: 'series/:name', lazy: lazyRoute(() => import('@/routes/SeriesPage')) },
            { path: 'about', element: <AboutPage /> },
            { path: '*', lazy: lazyRoute(() => import('@/routes/NotFoundPage')) },
          ],
        },
      ],
    },
  ],
  // GitHub Pages 部署在 /manuscript-archive/ 子路径,路由需以部署根为基准
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export default function App() {
  return <RouterProvider router={router} />
}
