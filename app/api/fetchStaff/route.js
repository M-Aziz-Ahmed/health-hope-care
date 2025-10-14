import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const staff = await User.find({ role: 'staff' }).select('name email location');
    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch staff', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
