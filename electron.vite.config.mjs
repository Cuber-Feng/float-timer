import { resolve } from 'path';
// import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [
      // 1. 如果使用了 externalizeDepsPlugin，大部分原生依赖会被自动过滤
      externalizeDepsPlugin()
    ],
    build: {
      rollupOptions: {
        // 2. 显式地将 better-sqlite3 标记为外部模块
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          stats: resolve('src/renderer/stats.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
});
