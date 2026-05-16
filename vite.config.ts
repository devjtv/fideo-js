import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Fideo',
      fileName: (format) => (format === 'es' ? 'fideo.js' : 'fideo.umd.cjs'),
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'fideo.css',
      },
    },
    sourcemap: true,
  },
  server: {
    open: '/examples/index.html',
  },
});
