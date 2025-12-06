// app/api/check-admin/route.ts
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get?.('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Validate ObjectId format to avoid Mongoose CastErrors
    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
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
    // Log full stack for easier debugging
    console.error('Admin check failed:', error?.stack || error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
