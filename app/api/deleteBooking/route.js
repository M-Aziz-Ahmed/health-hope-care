import { connectDB } from '@/lib/db';
import Booking from '@/models/booking';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await Booking.deleteOne({ _id: id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete booking', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
