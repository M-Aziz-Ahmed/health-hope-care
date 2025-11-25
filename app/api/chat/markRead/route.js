import { connectDB } from '@/lib/db';
import ChatMessage from '@/models/Chat';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Mark all unread messages as read for this booking (except messages sent by current user)
    await ChatMessage.updateMany(
      { 
        bookingId, 
        senderId: { $ne: userId },
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}

