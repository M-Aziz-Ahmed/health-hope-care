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

    // Analytics aggregations (if Analytics model exists)
    let analyticsSummary = {
      visitsLast7Days: 0,
      averageSessionMinutes: 0,
      clicks: 0,
      countries: [],
      topPages: [],
      osBreakdown: [],
      platformBreakdown: []
    };

    try {
      const Analytics = (await import('@/models/Analytics')).default;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const visits = await Analytics.countDocuments({ type: 'pageview', createdAt: { $gte: sevenDaysAgo } });
      const clicks = await Analytics.countDocuments({ type: 'click', createdAt: { $gte: sevenDaysAgo } });
      const sessions = await Analytics.find({ type: 'session', duration: { $gt: 0 }, createdAt: { $gte: sevenDaysAgo } }).select('duration');

      // visits by day for last 7 days
      const visitsByDay = await Analytics.aggregate([
        { $match: { type: 'pageview', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // clicks by day for last 7 days
      const clicksByDay = await Analytics.aggregate([
        { $match: { type: 'click', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      const avgMinutes = sessions.length > 0 ? Math.round((sessions.reduce((s, x) => s + (x.duration || 0), 0) / sessions.length) / 60) : 0;

      // countries
      const countriesAgg = await Analytics.aggregate([
        { $match: { country: { $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // top pages
      const pagesAgg = await Analytics.aggregate([
        { $match: { type: 'pageview' } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // os/platform breakdown (from platform/userAgent)
      const osAgg = await Analytics.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      analyticsSummary = {
        visitsLast7Days: visits,
        averageSessionMinutes: avgMinutes,
        clicks,
        visitsByDay: visitsByDay.map(v => ({ day: v._id, visits: v.count })),
        clicksByDay: clicksByDay.map(c => ({ day: c._id, clicks: c.count })),
        countries: countriesAgg.map(c => ({ label: c._id || 'Unknown', value: c.count })),
        topPages: pagesAgg.map(p => ({ path: p._id || '/', visits: p.count })),
        osBreakdown: osAgg.map(o => ({ label: o._id || 'Unknown', value: o.count })),
        platformBreakdown: osAgg.map(o => ({ label: o._id || 'Unknown', value: o.count }))
      };
    } catch (e) {
      // Analytics model may not exist or DB may be empty — ignore
      console.warn('Analytics aggregation skipped:', e?.message || e);
    }

    return NextResponse.json({
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalServices,
      staffCount,
      recentBookings,
      bookingsByMonth,
      analytics: analyticsSummary
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
