import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'https://www.healthhopecare.com';
    const sitemapUrl = `${base.replace(/\/$/, '')}/sitemap.xml`;
    const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
    return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error('robots.txt error', err);
    return new NextResponse('User-agent: *\nAllow: /\n', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}
