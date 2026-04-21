import { defineConfig } from 'vite';

export default defineConfig({
  base: '/salafull/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { main: 'index.html' }
    }
  }
});
