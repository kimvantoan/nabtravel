import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.bstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.agoda.net",
      },
      {
        protocol: "https",
        hostname: "pix6.agoda.net",
      },
      {
        protocol: "https",
        hostname: "fastly.4sqi.net",
      },
      {
        protocol: "https",
        hostname: "media-cdn.tripadvisor.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "http", // Dành cho các hình ảnh không có SSL
        hostname: "example.com",
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
