/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // added for ECR , App Runner deployment
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
    // Automatically remove console.* statements in production
    removeConsole: process.env.NODE_ENV === 'production',
    // OR keep only errors and warnings:
    // removeConsole: { exclude: ['error', 'warn'] },
  },
}
// Amplify.configure(amplifyConfig)
export default nextConfig
