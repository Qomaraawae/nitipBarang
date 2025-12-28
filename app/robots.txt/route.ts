export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nitipbarang.netlify.app'
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /*?*

Sitemap: ${baseUrl}/sitemap.xml`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}