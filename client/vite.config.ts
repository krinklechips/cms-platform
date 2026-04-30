import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * Moves Vite's multi-page HTML output into subdirectories so Express can
 * serve them as /platform-admin/, /tenant-dashboard/, and /www/ (directory with index.html).
 * The www entry is additionally copied to /www/pricing/index.html and /www/pay/index.html
 * so that the SPA fallback in Express can serve React Router routes.
 */
function moveHtmlToSubdirs(): Plugin {
  return {
    name: 'move-html-to-subdirs',
    closeBundle() {
      const outDir = path.resolve(__dirname, '../public')
      const entries = ['platform-admin', 'tenant-dashboard', 'www']
      for (const name of entries) {
        const src = path.join(outDir, `${name}.html`)
        const destDir = path.join(outDir, name)
        const dest = path.join(destDir, 'index.html')
        if (fs.existsSync(src)) {
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
          fs.renameSync(src, dest)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), moveHtmlToSubdirs()],
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
        'www': path.resolve(__dirname, 'www.html'),
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
