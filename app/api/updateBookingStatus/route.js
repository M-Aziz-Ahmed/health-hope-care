import { connectDB } from '@/lib/db';
import Booking from '@/models/booking';
import Notification from '@/models/Notification';
import User from '@/models/Users';
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

    // Notify assigned staff when status changes, otherwise notify admins
    try {
      if (booking.assignedStaff) {
        await Notification.create({ to: booking.assignedStaff, message: `Booking ${booking._id} status changed to ${status}`, booking: booking._id });
      } else {
        const admins = await User.find({ role: { $in: ['admin', 'owner'] } }).select('_id');
        const notifications = admins.map(a => ({ to: a._id, message: `Booking ${booking._id} status changed to ${status}`, booking: booking._id }));
        if (notifications.length) await Notification.insertMany(notifications);
      }
    } catch (notifyErr) {
      console.error('Failed creating notifications on status change', notifyErr);
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error) {
    console.error('Failed to update booking status', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
