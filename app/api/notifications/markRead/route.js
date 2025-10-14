import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const note = await Notification.findById(id);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.to.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    note.read = true;
    await note.save();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Mark read failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
