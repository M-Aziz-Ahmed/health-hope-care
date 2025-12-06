import { NextResponse } from 'next/server';

// Upload endpoint disabled — file/image/voice uploads removed to support
// serverless (Vercel) deployment. Keep this route to return a clear message
// for clients that may still call it.

export async function POST() {
  return NextResponse.json({ error: 'File uploads disabled. Chat supports text and location only.' }, { status: 410 });
}

