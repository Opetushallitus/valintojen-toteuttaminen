// Kevyt esikatselupalvelin e2e-testeille ja tuotannonkaltaiselle lokaaliajolle.
// Tarjoilee buildatun SPA:n (dist/client) base-polun alta SPA-fallbackilla ja
// proxyttaa muut pyynnöt virkailija-ympäristöön (testeissä mock-palvelin :3104).
// Korvaa `vite preview`n, joka on rikki basename + SPA -yhdistelmällä (RR#12083).
import { createServer } from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import sirv from 'sirv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Pidettävä synkassa src/lib/base-path.ts:n kanssa.
const BASE_PATH = '/valintojen-toteuttaminen';
const PORT = 3404;
const virkailijaOrigin = process.env.VITE_VIRKAILIJA_URL;

const serveStatic = sirv('dist/client', { dev: false });
const indexHtml = fs.readFileSync('dist/client/index.html');

const proxy = createProxyMiddleware({
  autoRewrite: true,
  changeOrigin: true,
  cookieDomainRewrite: 'localhost',
  secure: false,
  target: virkailijaOrigin,
  headers: { 'Access-Control-Allow-Origin': virkailijaOrigin },
  // Ei keep-aliveä eikä pitkää roikkumista: e2e-ajossa yksi Node-prosessi
  // palvelee satoja testejä, joten yhteyksien kertyminen ja roikkuvat pyynnöt
  // rikkoisivat networkidle-odotuksen. Suljetaan yhteydet ja päätetään virheet.
  agent: new http.Agent({ keepAlive: false }),
  proxyTimeout: 10000,
  on: {
    error: (_err, _req, res) => {
      if (res && 'writeHead' in res && !res.headersSent) {
        res.writeHead(502);
      }
      res?.end?.();
    },
  },
});

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem'),
};

createServer(httpsOptions, (req, res) => {
  const { pathname } = new URL(req.url, `https://localhost:${PORT}`);
  if (pathname === '/' || pathname === '') {
    res.writeHead(302, { Location: `${BASE_PATH}/` });
    res.end();
  } else if (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`)) {
    // Poistetaan base-polku, jotta sirv tarjoilee dist/client-juuresta.
    req.url = req.url.slice(BASE_PATH.length) || '/';
    serveStatic(req, res, () => {
      // SPA-fallback: tarjoillaan index.html kaikille reiteille, joita ei löydy
      // tiedostona. Ei käytetä sirvin single-tilaa, koska se tulkitsee pisteitä
      // sisältävät OID-polut virheellisesti tiedostopyynnöiksi.
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(indexHtml);
    });
  } else {
    proxy(req, res);
  }
})
  .listen(PORT, () => {
    console.log(`Preview server: https://localhost:${PORT}${BASE_PATH}/`);
  })
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  });
