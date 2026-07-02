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
  optimizeDeps: {
    exclude: ['onnxruntime-web', 'onnxruntime-web/wasm'],
    include: ['react-markdown'],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
})
