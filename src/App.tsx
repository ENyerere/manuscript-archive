import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/layout/Layout'
import HomePage from '@/routes/HomePage'

// 路由级代码分割:首页保持即时加载,其余路由按需加载
// (文章页带走 react-markdown/rehype-highlight 等大依赖,不进首屏 bundle)
const PostPage = lazy(() => import('@/routes/PostPage'))
const ArchivesPage = lazy(() => import('@/routes/ArchivesPage'))
const TagsPage = lazy(() => import('@/routes/TagsPage'))
const TagPage = lazy(() => import('@/routes/TagPage'))
const SeriesPage = lazy(() => import('@/routes/SeriesPage'))
const AboutPage = lazy(() => import('@/routes/AboutPage'))
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'))

/** 懒加载路由的悬挂态:hairline 风格,静默不抢眼 */
function Pending() {
  return (
    <div className="py-24">
      <p className="font-mono text-xs text-muted-foreground tracking-[0.08em]">加载中…</p>
    </div>
  )
}

const lazy_ = (element: React.ReactNode) => <Suspense fallback={<Pending />}>{element}</Suspense>

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'posts/:slug', element: lazy_(<PostPage />) },
      { path: 'archives', element: lazy_(<ArchivesPage />) },
      { path: 'tags', element: lazy_(<TagsPage />) },
      { path: 'tags/:tag', element: lazy_(<TagPage />) },
      { path: 'series/:name', element: lazy_(<SeriesPage />) },
      { path: 'about', element: lazy_(<AboutPage />) },
      { path: '*', element: lazy_(<NotFoundPage />) },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
