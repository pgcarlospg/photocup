import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');

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
      // NOTE: /api/v1/* is intentionally NOT here — it is handled by the route
      // handler at src/app/api/v1/[...path]/route.ts which takes priority over
      // rewrites in Next.js App Router.  Adding it here would be a no-op but
      // makes the intent clearer and avoids confusion.
      //
      // /uploads/* has NO route handler, so it needs a rewrite for local dev.
      // In production nginx handles this directly (backend:5001/uploads/*).
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
