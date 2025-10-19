// import { Amplify } from 'aws-amplify';
// import amplifyConfig from './lib/amplify-config';
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
}
// Amplify.configure(amplifyConfig)
export default nextConfig
