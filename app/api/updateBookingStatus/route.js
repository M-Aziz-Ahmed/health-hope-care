import { connectDB } from '@/lib/db';
import Booking from '@/models/booking';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error) {
    console.error('Failed to update booking status', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
