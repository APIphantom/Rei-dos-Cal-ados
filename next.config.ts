import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      /** Imagens hospedadas no Wix (subdomínios dinâmicos *.wixmp.com) */
      {
        protocol: "https",
        hostname: "*.wixmp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

