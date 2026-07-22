/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['192.168.10.139', '192.168.10.115', 'localhost:9002', 'menusnap.colorhutbd.xyz'],
  experimental: {
    serverActions: {
      bodySizeLimit: '32mb',
    },
  },
  trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/panel/:path*',
        destination: '/m-admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
