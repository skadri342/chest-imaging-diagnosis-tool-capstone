import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Configure CORS for development server
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      credentials: true,
    },
    // Enable proxy for API requests during development
    proxy: {
      '/api': {
        target: 'http://192.168.2.132:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  // Enable more detailed error logging
  build: {
    sourcemap: true,
  },
})
