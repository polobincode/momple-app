
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: RESTART SERVER (npm run dev) AFTER CHANGING THIS FILE
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    server: {
      host: true, 
      proxy: {
        '/gov-api': {
          target: 'https://api.socialservice.or.kr:444',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gov-api/, ''),
          secure: false, // Required for some self-signed or gov certs
        }
      }
    }
  }
})
