/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'colorhutbd.xyz', // Updated to be more general
        port: '',
        pathname: '/**', // Allows any path on this domain
      },
      {
        protocol: 'https',
        hostname: 'erp.colorhutbd.xyz',
        port: '',
        pathname: '/file/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
