/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

const basePath = '/valintojen-toteuttaminen';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  basePath,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
  env: {
    basePath,
    VIRKAILIJA_URL: process.env.VIRKAILIJA_URL,
  },
  ...(isProd
    ? {
        assetPrefix: '/static',
        output: 'standalone',
      }
    : {}),
};

export default nextConfig;
