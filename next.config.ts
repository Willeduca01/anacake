import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cardapio",
        permanent: false,
      },
      {
        source: "/servicos",
        destination: "/inicio#servicos",
        permanent: false,
      },
      {
        source: "/localizacao",
        destination: "/inicio#localizacao",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

