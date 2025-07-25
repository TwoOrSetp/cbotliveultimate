import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html')
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@/app': resolve(process.cwd(), 'src/app'),
      '@/utils': resolve(process.cwd(), 'src/utils'),
      '@/styles': resolve(process.cwd(), 'src/styles')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
  },
  preview: {
    port: 4173,
    open: true,
    host: true
  },
  base: './',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot', '**/*.png', '**/*.jpg', '**/*.svg', '**/*.ico'],
  optimizeDeps: {
    include: ['src/**/*.js']
  }
})
