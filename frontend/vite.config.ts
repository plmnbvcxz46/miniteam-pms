import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 本机开发时把 /api 请求转给本机后端，和线上 nginx 的转发规则一致
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
