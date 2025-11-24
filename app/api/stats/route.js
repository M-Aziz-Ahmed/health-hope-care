import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import Booking from '@/models/booking';

export async function GET() {
  try {
    await connectDB();
    
    const [totalUsers, totalBookings, pendingBookings, confirmedBookings, cancelledBookings, staffCount] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Confirmed' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      User.countDocuments({ role: 'staff' })
    ]);

    // Get total services count (handle if Service model doesn't exist yet)
    let totalServices = 0;
    try {
      const Service = (await import('@/models/Service')).default;
      totalServices = await Service.countDocuments({ isActive: true });
    } catch (e) {
      totalServices = 0;
    }

    const recentBookings = await Booking.find().sort({ date: -1 }).limit(5);

    // Get bookings by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const bookingsByMonth = await Booking.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalServices,
      staffCount,
      recentBookings,
      bookingsByMonth
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
