import { defineConfig } from 'vite';

export default defineConfig({
  base: '/andura/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { main: 'index.html' }
    }
  }
});
