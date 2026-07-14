import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import { optimizePackageImports } from './vite-plugin-optimize-package-imports';

export default defineConfig({
  plugins: [react(), optimizePackageImports(['@mui/icons-material'])],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@tests': path.resolve(import.meta.dirname, './tests'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    dir: './src',
    include: ['**/**.test.?(c|m)[jt]s?(x)'],
    coverage: {
      include: ['src/**'],
    },
    setupFiles: ['./vitest-setup.ts'],
    server: {
      deps: {
        inline: ['@opetushallitus/oph-design-system'],
      },
    },
  },
});
