import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  compress: true,
  serverExternalPackages: ["mongoose", "mongodb", "ioredis", "unpdf"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "radix-ui",
    ],
  },
};

export default nextConfig;

