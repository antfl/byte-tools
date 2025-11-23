import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('monaco-editor')) {
            if (id.includes('language') || id.includes('basic-languages')) {
              return 'monaco-languages'
            }
            if (id.includes('editor.api')) {
              return 'monaco-editor'
            }
            return 'monaco-core'
          }
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('browser-image-compression') || id.includes('exifr')) {
              return 'image-vendor'
            }
            if (id.includes('jsondiffpatch') || id.includes('jsonrepair')) {
              return 'json-vendor'
            }
            return 'vendor'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 4000
  }
})
