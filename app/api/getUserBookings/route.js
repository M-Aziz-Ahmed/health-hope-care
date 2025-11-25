import { connectDB } from "@/lib/db";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        // Get email from query parameters
        const { searchParams } = new URL(request.url);
        let email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
        }

        // Normalize email: trim and convert to lowercase for consistent matching
        email = email.trim().toLowerCase();

        // Find all bookings for this email (case-insensitive), sorted by date (most recent first)
        // Using $regex for case-insensitive matching to handle any existing data with different cases
        // Escape special regex characters in email
        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const bookings = await Booking.find({ 
            email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
        })
            .sort({ date: -1 })
            .populate('assignedStaff', 'name email role phone');

        console.log(`Found ${bookings.length} bookings for email: ${email}`);
        return NextResponse.json(bookings, { status: 200 });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return NextResponse.json({ error: 'Failed to fetch user bookings' }, { status: 500 });
    }
}
