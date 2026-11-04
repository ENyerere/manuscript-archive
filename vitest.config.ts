import { defineConfig } from 'vitest/config'
import path from 'node:path'

// 独立配置:不继承 vite.config.ts,避免加载构建期插件(git/网络 fetch)的副作用
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
