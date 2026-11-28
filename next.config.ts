import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

/*
 * What the browser may load and where it may send things. Scripts, styles,
 * fonts and data all come from this site; photos may come from the image host
 * (Cloudflare R2), so any https image is allowed. Nothing may frame the site,
 * plugins are off, and forms only post here or to Google sign-in. Next.js
 * writes small inline scripts into each page, so inline scripts stay allowed.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Always HTTPS from the first visit on (browsers ignore this over plain http).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  env: {
    // Always the real backend. Automated tests set NEXT_PUBLIC_DATA_SOURCE=mock
    // to run without a database.
    NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE || "remote",
  },
  cacheComponents: true,
  // 90 for the round category photos, which are small but should look crisp.
  images: { qualities: [75, 90] },
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "radix-ui"],
    // The Tailwind loader scans every source file for class names, but the build
    // cache only notices changes to the CSS file itself. With it on, builds
    // (including on Vercel, which restores .next/cache) shipped stale styles.
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
