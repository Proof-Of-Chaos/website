/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: ['proofofchaos.app', 'gateway.ipfs.io', 'ipfs.rmrk.link', 'prerender.rmrk.link'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self' ipfs.rmrk.link; script-src 'none'; sandbox;",',
  },
  trailingSlash: true,
}

module.exports = nextConfig
