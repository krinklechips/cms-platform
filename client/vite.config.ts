import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../public'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'platform-admin': path.resolve(__dirname, 'platform-admin.html'),
        'tenant-dashboard': path.resolve(__dirname, 'tenant-dashboard.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4100',
      '/uploads': 'http://localhost:4100',
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
