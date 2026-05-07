import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.asse.devtunnels.ms",
        "*.devtunnels.ms",
      ],
    },
  },
};

export default nextConfig;
