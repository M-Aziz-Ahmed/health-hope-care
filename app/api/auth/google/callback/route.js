import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/Users';

async function exchangeCode(code, redirectUri) {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    console.log('Google callback - Code received:', !!code);
    
    if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });

    // Prefer redirectUri passed in state (set by start route) to avoid mismatch
    let redirectUri = null;
    try {
      const state = url.searchParams.get('state');
      if (state) redirectUri = decodeURIComponent(state);
    } catch (e) {
      // ignore
    }
    if (!redirectUri) {
      const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || `${url.protocol}//${url.host}`;
      redirectUri = `${base.replace(/\/$/, '')}/api/auth/google/callback`;
    }
    console.log('Google callback - Redirect URI:', redirectUri);

    const tokenData = await exchangeCode(code, redirectUri);
    const accessToken = tokenData.access_token;
    console.log('Google callback - Access token received:', !!accessToken);
    
    if (!accessToken) throw new Error('No access token from provider');

    // fetch userinfo
    const userRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const profile = await userRes.json();
    console.log('Google callback - Profile received:', profile.email);

    // profile contains: id, email, verified_email, name, given_name, family_name, picture, locale
    await connectDB();
    console.log('Google callback - Database connected');

    const email = profile.email && profile.email.toLowerCase();
    let user = null;
    if (email) user = await User.findOne({ email });
    
    if (!user) {
      console.log('Google callback - Creating new user:', email);
      user = await User.create({ 
        name: profile.name || 'Google User', 
        email: email || '', 
        role: 'user',
        password: '' // Google users don't need password
      });
    } else {
      console.log('Google callback - Existing user found:', email);
    }

    console.log('Google callback - User ID:', user._id.toString());
    
    // Get the base URL for absolute redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || `${url.protocol}//${url.host}`;
    const redirectUrl = `${baseUrl.replace(/\/$/, '')}/`;
    
    console.log('Google callback - Redirecting to:', redirectUrl);
    console.log('Google callback - Setting cookie with userId:', user._id.toString());
    
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('userId', user._id.toString(), { 
      httpOnly: true, 
      path: '/', 
      sameSite: 'lax', 
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('Google callback - Success! Redirecting...');
    return response;
  } catch (err) {
    console.error('Google callback error:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json({ error: 'Google auth failed', details: err.message }, { status: 500 });
  }
}
