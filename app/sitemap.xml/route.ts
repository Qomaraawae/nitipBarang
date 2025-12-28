import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nitipbarang.netlify.app'
  
  const urls = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/titip', priority: '0.8', changefreq: 'daily' },
    { url: '/ambil', priority: '0.8', changefreq: 'daily' },
    { url: '/histori', priority: '0.5', changefreq: 'weekly' },
    { url: '/settings', priority: '0.3', changefreq: 'monthly' },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(({ url, priority, changefreq }) => {
      return `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('')}
</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}