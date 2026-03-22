import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [
      {
        // Never cache HTML pages — ensures browsers always get fresh JS bundle references
        source: '/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf)).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
