/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app', // Allow images from Vercel Blob for placeholders
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
