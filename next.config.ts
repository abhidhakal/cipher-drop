import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: Disable source maps in production to hide original source code
  productionBrowserSourceMaps: false,

  // Security: Remove X-Powered-By header to hide framework information
  poweredByHeader: false,

  // Security: Configure strict headers for production
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ],
    },
  ],
};

export default nextConfig;

