import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Required for Cloudflare Pages / OpenNext
    // Do NOT use `output: 'export'` — we need SSR
    images: {
        // Cloudflare doesn't support Next.js Image Optimization
        // Use unoptimized or Cloudflare Image Resizing instead
        unoptimized: true,
    },
};

export default nextConfig;
