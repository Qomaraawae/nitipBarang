import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Image optimization config
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'], // Keep console.error in production for critical issues
    } : false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Konfigurasi Turbopack (wajib untuk Next.js 16+)
  turbopack: {
    // Kosongkan jika tidak butuh konfigurasi khusus
    // Atau tambahkan konfigurasi jika diperlukan:
    
    // Untuk mengurangi logs HMR yang berlebihan:
    // logLevel: 'error',
    
    // Jika perlu resolve alias:
    // resolveAlias: {
    //   // Contoh:
    //   // '@components': './components',
    //   // '@utils': './utils',
    // },
  },
};

export default nextConfig;