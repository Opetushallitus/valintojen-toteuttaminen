import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    dir: './tests/unit',
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
    },
    exclude: ['./cdk'],
  },
});
