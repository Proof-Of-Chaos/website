/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.ipfs.io",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
