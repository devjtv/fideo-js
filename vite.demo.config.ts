import { defineConfig } from 'vite';

export default defineConfig({
  root: 'examples',
  base: '/fideo-js/',
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
});
