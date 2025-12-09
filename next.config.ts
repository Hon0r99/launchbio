import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude test files and test utilities from production builds
  experimental: {
    serverComponentsExternalPackages: ["@testing-library/react", "@testing-library/jest-dom"],
  },
};

export default nextConfig;
