import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ORCHESTRATOR_URL: process.env.NEXT_PUBLIC_ORCHESTRATOR_URL,
  },
};

export default nextConfig;
