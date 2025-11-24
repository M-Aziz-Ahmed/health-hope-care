import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';

// GET all reviews (admin only - add auth check in production)
export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch all reviews:', error);
    return NextResponse.json([], { status: 200 });
  }
}
