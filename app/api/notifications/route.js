import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import Booking from '@/models/booking';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId =  cookieStore.get('userId')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const notes = await Notification.find({ to: userId }).sort({ createdAt: -1 }).populate('booking');
    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error('Fetch notifications failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
