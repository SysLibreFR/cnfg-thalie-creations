import type { NextConfig } from "next";

function safeHostname(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}

const apiHostname = safeHostname(
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(apiHostname ? [{ protocol: "https" as const, hostname: apiHostname }] : []),
      { protocol: "https" as const, hostname: "*.railway.app" },
      { protocol: "https" as const, hostname: "*.cfng.fr" },
      { protocol: "https" as const, hostname: "*.craieetfee.net" },
      { protocol: "http" as const, hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256],
  },
};

export default nextConfig;
