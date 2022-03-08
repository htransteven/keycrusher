/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["storage.googleapis.com", "lh3.googleusercontent.com"],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
