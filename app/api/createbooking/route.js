import { connectDB } from "@/lib/db";
import booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function POST (request){
    try {
        await connectDB();
        const data = await request.json();
        const newBooking = new booking(data);
        await newBooking.save();
        return NextResponse.json({ message: 'Booking created successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create Booking' }, { status: 500 });
    }
}