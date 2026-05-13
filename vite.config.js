import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base path so the app works on GitHub Pages subfolders
  base: './',
  build: {
    outDir: 'dist',
  },
});
