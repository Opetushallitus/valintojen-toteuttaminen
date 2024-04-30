import next from 'next';
import { parse } from 'url';
import { createServer } from 'https';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import nextConfig from './next.config.mjs';

const basePath = nextConfig.basePath;
const port = parseInt(process.env.PORT, 10) || 3404;

const virkailijaOrigin = process.env.VIRKAILIJA_URL;
const isProd = process.env.NODE_ENV === 'production';

const app = next({
  conf: nextConfig,
  dev: !isProd,
  hostname: 'localhost',
  port: port,
  env: process.env,
});

const handle = app.getRequestHandler();

const proxy = createProxyMiddleware({
  autoRewrite: true,
  headers: {
    'Access-Control-Allow-Origin': virkailijaOrigin,
  },
  changeOrigin: true,
  cookieDomainRewrite: 'localhost',
  secure: false,
  target: virkailijaOrigin,
});

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    if (!pathname || pathname === '' || pathname === '/') {
      res.writeHead(302, { Location: basePath });
      res.end();
    } else if (pathname.startsWith(basePath)) {
      handle(req, res, parsedUrl);
    } else {
      proxy(req, res);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log('ready - started server on url: https://localhost:' + port);
  });
});
