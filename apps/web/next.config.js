/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  images: {
    domains: ["picsum.photos"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${"http://localhost:8000"}/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${"http://localhost:8000"}/socket.io/:path*`,
      },
    ];
  },
  // Enable WebSocket connections in development
  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      { bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" },
    ];
    return config;
  },
};

export default nextConfig;
