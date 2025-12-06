import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const redirectUri = `${base.replace(/\/$/, '')}/api/auth/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    // include the redirectUri in state so callback can use the same value (avoids redirect_uri_mismatch)
    const state = encodeURIComponent(redirectUri);

    if (!clientId) {
      return NextResponse.json({ error: 'Google client ID not configured' }, { status: 500 });
    }
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account&state=${state}`;
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Google auth start error', err);
    return NextResponse.json({ error: 'Failed to start Google auth' }, { status: 500 });
  }
}
