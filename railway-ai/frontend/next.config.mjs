/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/request',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
