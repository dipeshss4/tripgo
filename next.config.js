
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      "images.unsplash.com",
      "images.pexels.com",
      "media0.giphy.com",
      "media1.giphy.com",
      "media3.giphy.com",
      "media4.giphy.com"
    ]
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  },
};
module.exports = nextConfig;
