import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'https://www.healthhopecare.com';
    const pages = ['/', '/services', '/about', '/contact', '/booking', '/reviews', '/login', '/staff'];
    const lastmod = new Date().toISOString();

    const urls = pages.map(p => `  <url>\n    <loc>${base.replace(/\/$/, '')}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

    return new NextResponse(xml, { status: 200, headers: { 'Content-Type': 'application/xml' } });
  } catch (err) {
    console.error('Sitemap error', err);
    return new NextResponse('Sitemap generation failed', { status: 500 });
  }
}
