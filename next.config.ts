import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HIGH-03: Content Security Policy — restricts script/resource origins
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires 'unsafe-inline' for its inline scripts; restrict with nonce in future
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: https://${supabaseHost}`,
              `connect-src 'self' https://${supabaseHost} https://*.supabase.co https://generativelanguage.googleapis.com`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // HIGH-03: HSTS — enforce HTTPS for 1 year
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
