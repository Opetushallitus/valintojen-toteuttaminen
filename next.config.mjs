/** @type {import('next').NextConfig} */

const API_URL = "https://virkailija.untuvaopintopolku.fi";

const nextConfig = {
  experimental: {
    middlewarePrefetch: "strict",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async rewrites() {
    return [
      {
        source: "/cas/:path*",
        destination: `${API_URL}/cas/:path*`,
      },
      {
        source: "/kouta-internal/:path*",
        destination: `${API_URL}/kouta-internal/:path*`,
      },
      {
        source: "/koodisto-service/:path*",
        destination: `${API_URL}/kodisto-service/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3404",
          }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Set-Cookie",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
