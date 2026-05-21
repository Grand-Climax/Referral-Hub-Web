import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Optional local dev proxy when API and Next run on different ports.
  // WebSockets should use NEXT_PUBLIC_WS_URL or derive from NEXT_PUBLIC_API_URL (direct), not this proxy.
  async rewrites() {
    const apiOrigin =
      process.env.API_PROXY_TARGET ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
      {
        source: "/ws",
        destination: `${apiOrigin}/ws`,
      },
    ];
  },
};

export default nextConfig;
