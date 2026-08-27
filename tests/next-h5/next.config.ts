import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@meu/form-react",
    "@meu/icons-react",
    "@meu/mobile",
    "@meu/primitives-react"
  ]
};

export default nextConfig;
