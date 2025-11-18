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
  reactStrictMode: false,
}
export default nextConfig
