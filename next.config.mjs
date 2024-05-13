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

const isProd = process.env.NODE_ENV === 'production';

const isStandalone = process.env.NEXT_OUTPUT_STANDALONE === 'true' ?? isProd;

const basePath = '/valintojen-toteuttaminen';

const nextConfig = {
  basePath,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    APP_URL: process.env.APP_URL,
  },
  output: isStandalone ? 'standalone' : undefined,
};

export default nextConfig;
