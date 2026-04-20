import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    /** Inclui 2560 para aproximar melhor heros largos; qualidade 90 usada no hero. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unpkg.com",
        pathname: "/**",
      },
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

