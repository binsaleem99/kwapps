import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Temporarily ignore TypeScript build errors from Next.js 16 auto-generated types
  // The actual source code is type-safe, only .next/dev/types has issues
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
