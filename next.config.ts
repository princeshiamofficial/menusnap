
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
      }
    ],
  },
};

export default nextConfig;
