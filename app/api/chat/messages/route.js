import { connectDB } from '@/lib/db';
import ChatMessage from '@/models/Chat';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get all messages for this booking
    const messages = await ChatMessage.find({ bookingId })
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, message, senderName, senderRole, messageType, mediaUrl, mediaFileName, mediaSize } = await request.json();

    if (!bookingId || !senderName || !senderRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Message or media must be provided
    if (!message && !mediaUrl) {
      return NextResponse.json({ error: 'Message or media is required' }, { status: 400 });
    }

    const chatMessage = new ChatMessage({
      bookingId,
      senderId: userId,
      senderName,
      senderRole,
      message: message ? message.trim() : '',
      messageType: messageType || 'text',
      mediaUrl: mediaUrl || null,
      mediaFileName: mediaFileName || null,
      mediaSize: mediaSize || null,
    });

    await chatMessage.save();

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

