import { connectDB } from '@/lib/db';
import Booking from '@/models/booking';
import User from '@/models/Users';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { bookingId, staffId } = await request.json();
    if (!bookingId || !staffId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const staff = await User.findById(staffId);
    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

    booking.assignedStaff = staff._id;
    booking.status = 'Confirmed';
    await booking.save();

    // notify staff
    const notif = new Notification({ to: staff._id, message: `You have been assigned to booking ${booking._id}`, booking: booking._id });
    await notif.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Assign staff failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
