import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML/JS to out/, which Cloudflare Pages serves.
// Every route is prerendered from data/*.json, so no server runtime is needed.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
