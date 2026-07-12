import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 專案頁面部署於 https://<user>.github.io/clm-blank-fill-demo/
// 因此 base 必須設定為 repo 名稱。
export default defineConfig({
  plugins: [react()],
  base: '/clm-blank-fill-demo/',
})
