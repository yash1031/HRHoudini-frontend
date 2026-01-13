/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // added for ECR , App Runner deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compiler: {
    // Remove all console statements in production except errors and warnings
    removeConsole: process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
}
export default nextConfig
