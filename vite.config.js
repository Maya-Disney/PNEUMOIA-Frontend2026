import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    // Doit être PREMIER : sert le .mjs ORT directement avant que Vite
    // n'intercepte la requête avec sa restriction "fichiers /public non importables"
    {
      name: 'ort-wasm-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0]
          if (url?.startsWith('/ort/') && url.endsWith('.mjs')) {
            const filePath = path.join(process.cwd(), 'public', url)
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'public, max-age=86400')
              res.end(fs.readFileSync(filePath))
              return
            }
          }
          next()
        })
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web', 'onnxruntime-web/wasm'],
    include: ['react-markdown'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('framer-motion')) return 'animations'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    port: 4173,
  },
})
