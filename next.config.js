/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: ['gateway.ipfs.io', 'ipfs.rmrk.link'],
  },
}

module.exports = nextConfig
