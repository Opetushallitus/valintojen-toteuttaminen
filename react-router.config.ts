import type { Config } from '@react-router/dev/config';
import { BASE_PATH } from './src/lib/base-path';

export default {
  // Puhdas SPA: ei ajonaikaista SSR:ää (Spring Boot tarjoilee staattisena).
  ssr: false,
  // basenamen on alettava Viten base-arvolla (`${BASE_PATH}/`). React Router
  // normalisoi trailing slashin ajossa.
  basename: `${BASE_PATH}/`,
  appDirectory: 'src/app',
  buildDirectory: 'dist',
} satisfies Config;
