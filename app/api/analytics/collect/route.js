import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Analytics from '@/models/Analytics';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('remote_addr') || null;

    // attempt geo lookup server-side for more reliable country detection
    // Prefer provider headers (Vercel/Cloudflare) first
    let country = '';
    try {
      country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
      if (!country && ip) {
        // x-forwarded-for can be a comma list
        const firstIp = ip.split(',')[0].trim();
        try {
          // lazy-load geoip-lite to avoid module-level errors when its data files are missing
          // (some environments or installs may not have the data files present)
          // eslint-disable-next-line global-require, import/no-extraneous-dependencies
          const geoip = require('geoip-lite');
          const geo = geoip && geoip.lookup ? geoip.lookup(firstIp) : null;
          if (geo && geo.country) country = geo.country;
        } catch (inner) {
          // If geoip-lite data is missing or require fails, quietly skip geo lookup
          console.warn('geoip lookup skipped:', inner?.code || inner?.message || inner);
        }
      }
    } catch (e) {
      console.warn('Geo detection failed', e?.message || e);
      country = '';
    }

    const doc = new Analytics({
      type: body.type || 'pageview',
      url: body.url || '',
      path: body.path || '',
      title: body.title || '',
      event: body.event || '',
      duration: Number(body.duration) || 0,
      userAgent: body.userAgent || request.headers.get('user-agent') || '',
      platform: body.platform || '',
      ip,
      country: body.country || country || '',
      referrer: body.referrer || '',
      source: body.source || '',
      medium: body.medium || '',
      os: body.os || '',
      deviceType: body.deviceType || ''
    });

    await doc.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics collect error:', error);
    return NextResponse.json({ error: 'Failed to collect' }, { status: 500 });
  }
}
