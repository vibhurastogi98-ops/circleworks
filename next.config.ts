import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDevelopment = process.env.NODE_ENV !== "production";
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "";
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    isDevelopment ? "'unsafe-eval'" : "",
    "https://cdn.plaid.com",
    "https://js.stripe.com",
  ].filter(Boolean).join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  [
    "connect-src",
    "'self'",
    "https://api.circleworks.com",
    "wss://api.circleworks.com",
    supabaseOrigin,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    isDevelopment ? "http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*" : "",
  ].filter(Boolean).join(" "),
  [
    "frame-src",
    "https://js.stripe.com",
    "https://cdn.plaid.com",
    "https://player.vimeo.com",
    "https://fast.wistia.net",
    "https://*.wistia.net",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
  ].join(" "),
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const immutableCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const publicStaticAssets = [
  "/dashboard-mockup.png",
  "/favicon.svg",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  outputFileTracingIncludes: {
    "/*": ["./src/emails/templates/**/*.mjml"],
  },

  // ✅ Fix for cross-origin dev issue
  allowedDevOrigins: ["127.0.0.1"],

  images: {
    deviceSizes: [640, 1024, 1280, 1920],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [immutableCacheHeader],
      },
      ...publicStaticAssets.map((source) => ({
        source,
        headers: [immutableCacheHeader],
      })),
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.circleworks.com" }],
        destination: "https://circleworks.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "circleworks.com" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://circleworks.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
