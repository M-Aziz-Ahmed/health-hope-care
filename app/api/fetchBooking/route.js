import { connectDB } from "@/lib/db";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find(); // variable renamed for clarity
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
