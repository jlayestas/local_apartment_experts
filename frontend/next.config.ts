import type { NextConfig } from "next";

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("API_URL environment variable is required in production.");
  }
  console.warn("API_URL not set — falling back to http://localhost:8080 (dev only)");
}

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy all /api/* requests to the Spring Boot backend.
    // The browser sees requests on localhost:3000 so SameSite=Strict cookies work correctly.
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl ?? "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
