import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  base: './',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot']
})
