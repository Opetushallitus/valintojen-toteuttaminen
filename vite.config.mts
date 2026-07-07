import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import {
  defineConfig,
  loadEnv,
  type Connect,
  type Plugin,
  type ProxyOptions,
  type ServerOptions,
} from 'vite';

import { BASE_PATH } from './src/lib/base-path';
import { optimizePackageImports } from './vite-plugin-optimize-package-imports';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const proxyOptions = (targetUrl: string): ProxyOptions => ({
  autoRewrite: true,
  headers: {
    'Access-Control-Allow-Origin': targetUrl,
  },
  changeOrigin: true,
  cookieDomainRewrite: 'localhost',
  secure: false,
  target: targetUrl,
});

/**
 * Ohjataan juuripolku sovelluksen base-polkuun (kuten vanha dev-server.mjs).
 */
const redirectRootToBasePath = (): Plugin => {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url === '/' || req.url === BASE_PATH) {
      res.writeHead(302, { Location: `${BASE_PATH}/` });
      res.end();
      return;
    }
    next();
  };
  return {
    name: 'redirect-root-to-base-path',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

const readHttpsOptions = () => {
  const key = path.resolve(__dirname, './certificates/localhost-key.pem');
  const cert = path.resolve(__dirname, './certificates/localhost.pem');
  if (fs.existsSync(key) && fs.existsSync(cert)) {
    return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) };
  }
  return undefined;
};

export default defineConfig(({ mode }) => {
  const env = Object.assign({}, process.env, loadEnv(mode, process.cwd(), ''));

  const virkailijaOrigin = env.VITE_VIRKAILIJA_URL;

  const serverOptions: ServerOptions = {
    port: 3404,
    host: 'localhost',
    https: readHttpsOptions(),
    proxy: virkailijaOrigin
      ? {
          // Ohjataan virkailijaan kaikki muu paitsi "/", base-polku ja sen alipolut
          [`^(?!(/$)|(${BASE_PATH}$)|(${BASE_PATH}/.*))`]:
            proxyOptions(virkailijaOrigin),
        }
      : undefined,
  };

  return {
    base: `${BASE_PATH}/`,
    plugins: [
      react(),
      optimizePackageImports(['@mui/icons-material']),
      redirectRootToBasePath(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@tests': path.resolve(__dirname, './tests'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: serverOptions,
    preview: serverOptions,
  };
});
