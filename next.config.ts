import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimized for Vercel deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',
      },
    ],
  },
};

export default nextConfig;
