import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the build root to this project, so a stray lockfile in a parent
  // directory cannot be picked up instead.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
