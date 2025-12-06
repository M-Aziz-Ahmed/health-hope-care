import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Analytics from '@/models/Analytics';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;

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
      country: body.country || ''
    });

    await doc.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics collect error:', error);
    return NextResponse.json({ error: 'Failed to collect' }, { status: 500 });
  }
}
