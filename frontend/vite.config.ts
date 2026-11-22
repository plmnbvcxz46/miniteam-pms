import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 只读 DEV_ 开头的变量，写在 frontend/.env.local 里（个人文件，已被忽略，不进仓库）
  const env = loadEnv(mode, '.', 'DEV_')
  return {
    plugins: [react()],
    server: {
      // 本机开发时把 /api 请求转给本机后端，和线上 nginx 的转发规则一致。
      // 想转到别的后端，在 .env.local 里写 DEV_API_TARGET=地址，不写就是本机后端
      proxy: {
        '/api': { target: env.DEV_API_TARGET || 'http://localhost:8080', changeOrigin: true },
      },
    },
  }
})
