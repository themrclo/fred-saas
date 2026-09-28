import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que o SQLite pré-seedado vá no bundle serverless (Vercel)
  outputFileTracingIncludes: {
    "/**/*": ["./prisma/seed.db", "./prisma/schema.prisma"],
  },
};

export default nextConfig;
