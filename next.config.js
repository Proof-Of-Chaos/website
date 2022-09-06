/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: ['gateway.ipfs.io', 'ipfs.rmrk.link'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self' ipfs.rmrk.link; script-src 'none'; sandbox;",
  },
  trailingSlash: true,
  experimental: {
        images: {
            unoptimized: true
        }
    }
}

module.exports = nextConfig
