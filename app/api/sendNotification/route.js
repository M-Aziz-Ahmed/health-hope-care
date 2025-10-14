import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { target, users, message, bookingId } = await request.json();
    if (!target || !message) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    let recipients = [];
    if (target === 'all') {
      const all = await User.find().select('_id');
      recipients = all.map(a => a._id);
    } else if (target === 'one') {
      if (!users || users.length !== 1) return NextResponse.json({ error: 'Provide single user id' }, { status: 400 });
      recipients = [users[0]];
    } else if (target === 'some') {
      if (!users || users.length === 0) return NextResponse.json({ error: 'Provide user ids' }, { status: 400 });
      recipients = users;
    } else {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    const notifications = recipients.map(r => ({ to: r, message, booking: bookingId || null }));
    await Notification.insertMany(notifications);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Send notification failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
