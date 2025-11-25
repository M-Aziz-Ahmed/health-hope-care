// app/api/check-admin/route.ts
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: 'Not logged in' }, { status: 401 });
    }

  const user = await User.findById(userId).select('name email role phone');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user info for frontend
    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || ''
    }, { status: 200 });

  } catch (error) {
    console.error('Admin check failed:', error);
    return NextResponse.json({ isAdmin: false, error: 'Server error' }, { status: 500 });
  }
}
