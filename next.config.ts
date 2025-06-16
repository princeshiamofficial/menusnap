
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
        hostname: 'colorhutbd.xyz',
        port: '',
        pathname: '/vm/api/uploads/**',
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
