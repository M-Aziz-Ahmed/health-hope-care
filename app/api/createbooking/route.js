import { connectDB } from "@/lib/db";
import Booking from "@/models/booking";
import User from "@/models/Users";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST (request){
    try {
        await connectDB();
        const data = await request.json();

        // Normalize email: trim and convert to lowercase for consistent storage
        if (data.email) {
            data.email = data.email.trim().toLowerCase();
        }

        // Accept optional location provided by client, else try to extract city from address (simple)
        const location = data.location || (data.address ? data.address.split(',').pop().trim() : '');

        const newBooking = new Booking({ ...data, location });
        await newBooking.save();

        // Notify all admins about new booking — in a real system we'd notify nearest staff
        const admins = await User.find({ role: { $in: ['admin', 'owner'] } }).select('_id');
        if (admins.length > 0) {
          const notifications = admins.map(a => ({ to: a._id, message: `New booking from ${newBooking.name} — ${newBooking.service}`, booking: newBooking._id }));
          await Notification.insertMany(notifications);
        }

        return NextResponse.json({ message: 'Booking created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Create booking failed:', error);
        return NextResponse.json({ error: 'Failed to create Booking' }, { status: 500 });
    }
}