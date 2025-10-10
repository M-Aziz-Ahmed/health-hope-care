// app/api/loginUser/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/Users";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Don't send password back
    const { password: _, ...userData } = user._doc;

    // Set userId cookie for authentication
    const response = NextResponse.json(userData, { status: 200 });
    response.cookies.set('userId', user._id.toString(), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      // secure: true, // Uncomment if using HTTPS
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return response;

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
