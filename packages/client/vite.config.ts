import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@game/shared': path.resolve(__dirname, '../shared/src')
    }
  }
});
