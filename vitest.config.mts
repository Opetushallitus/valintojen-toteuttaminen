import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
    exclude: ['./cdk'],
    setupFiles: ['./vitest-setup.ts'],
    server: {
      deps: {
        inline: ['@opetushallitus/oph-design-system'],
      },
    },
  },
});
