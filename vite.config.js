import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  test: {
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    passWithNoTests: true,
    environmentMatchGlobs: [
      ['src/**', 'jsdom'],
      ['netlify/**', 'node'],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**', 'netlify/functions/**'],
      exclude: ['src/test-setup.js', 'netlify/functions/__tests__/**'],
    },
  },
})
