import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Two separate apps built from one project:
//   /               -> minimal Sciety (index.html)
//   /discussions/   -> discussions.sciety (discussions/index.html)
// Builds are served from elifepathways.github.io/ux-prototypes/sciety-discussions/.
// The dev server stays at "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ux-prototypes/sciety-discussions/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        sciety: resolve(import.meta.dirname, 'index.html'),
        discussions: resolve(import.meta.dirname, 'discussions/index.html'),
      },
    },
  },
}));
