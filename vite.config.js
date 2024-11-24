import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        content: './src/content/index.js',
        background: './src/background/index.js',
      },
      output: {
        entryFileNames: 'src/[name]/index.js',
      }
    }
  }
})
