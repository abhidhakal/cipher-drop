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
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
            "script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "frame-src https://www.google.com https://www.recaptcha.net",
            "connect-src 'self' https://www.google.com https://api.stripe.com",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;

