import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    outDir: 'chrome-extension',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(import.meta.dirname, 'src/main.jsx')
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      }
    }
  }
});
