import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/ambient-studio/',
  server: {
    port: 3004,
  },
  preview: {
    port: 3004,
    allowedHosts: ['dexters-mac-mini.chimp-danio.ts.net', 'localhost'],
  },
})
