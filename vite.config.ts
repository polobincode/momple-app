import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Casting process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    // 로컬 개발 환경에서 CORS 문제 방지 또는 API 폴더 구조 인식용
    server: {
      host: true, // 모든 네트워크 인터페이스에서 접근 허용
    }
  }
})