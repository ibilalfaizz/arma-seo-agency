/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seoptimer.com',
        pathname: '/screenshots/**',
      },
      {
        protocol: 'http',
        hostname: 'seoptimer.test',
        pathname: '/screenshots/**',
      },
    ],
  },
}

module.exports = nextConfig

