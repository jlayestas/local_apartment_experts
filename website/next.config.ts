import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Dev proxy: forwards /api/* to the backend so client-side fetches work
  // without CORS configuration. In production, set NEXT_PUBLIC_API_URL instead.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const backend = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
