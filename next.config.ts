import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // Shared hosting không hỗ trợ sharp — serve ảnh gốc
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/:path*`
          : 'http://127.0.0.1:8000/storage/:path*',
      },
    ];
  },
};

export default nextConfig;
