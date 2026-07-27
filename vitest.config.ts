import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Process real CSS so the injected host stylesheet and the adopted
    // controls stylesheet carry their actual contents under test.
    css: true,
  },
});
