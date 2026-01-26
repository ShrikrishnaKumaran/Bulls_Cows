import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to network
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.68.10.134:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://10.68.10.134:5000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
