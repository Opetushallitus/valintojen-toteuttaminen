import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    dir: './src',
    include: ['**/**.test.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
    },
    exclude: ['./cdk'],
  },
});
