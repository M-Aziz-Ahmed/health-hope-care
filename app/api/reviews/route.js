import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';

// GET all approved reviews
export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('Fetched reviews:', reviews.length);
    
    // If no reviews exist, create some sample ones
    if (reviews.length === 0) {
      const sampleReviews = [
        {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          service: 'Injection at Home',
          rating: 5,
          review: 'Excellent service! The nurse was professional and caring. Highly recommend.',
          approved: true
        },
        {
          name: 'Michael Chen',
          email: 'michael@example.com',
          service: 'ECG at Home',
          rating: 5,
          review: 'Very convenient and the staff was knowledgeable. Great experience overall.',
          approved: true
        },
        {
          name: 'Emily Davis',
          email: 'emily@example.com',
          service: 'Blood Test',
          rating: 4,
          review: 'Quick and painless. The results were delivered on time. Good service.',
          approved: true
        }
      ];
      
      await Review.insertMany(sampleReviews);
      const newReviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
      return NextResponse.json(newReviews);
    }
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST new review
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Auto-approve for now (change to false in production)
    const review = await Review.create({
      name: body.name,
      email: body.email,
      service: body.service,
      rating: body.rating,
      review: body.review,
      approved: true // Auto-approve for testing (change to false for production)
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Review submitted successfully!',
      review 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit review' 
    }, { status: 500 });
  }
}
