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
        destination: `https://xenia-api.vercel.app/:path*`,
        has: [
          {
            type: "cookie",
            key: "token",
          },
        ],
      },
      {
        source: "/socket.io/:path*",
        destination: `https://xenia-api.vercel.app/socket.io/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
          },
        ],
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
