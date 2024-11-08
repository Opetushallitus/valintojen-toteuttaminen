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

const isStandalone = process.env.STANDALONE === 'true';

const basePath = '/valintojen-toteuttaminen';

const nextConfig = {
  basePath,
  compress: false, // nginx hoitaa pakkauksen
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: Boolean(process.env.CI),
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
  output: isStandalone ? 'standalone' : undefined,
  async redirects() {
    // Uudelleenohjaus oletuksena "hakukohteittain"-välilehdelle
    return [
      {
        source: '/haku/:hakuoid',
        destination: '/haku/:hakuoid/hakukohde',
        permanent: true,
      },
      {
        source: '/haku/:hakuoid/hakukohde/:hakukohdeoid',
        destination: '/haku/:hakuoid/hakukohde/:hakukohdeoid/perustiedot',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
