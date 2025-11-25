// app/api/loginUser/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/Users";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Normalize email to lowercase for consistent matching
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if password is already hashed (starts with $2a$ or $2b$)
    const isPasswordHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    
    let passwordMatch = false;
    
    if (isPasswordHashed) {
      // Password is hashed, use bcrypt.compare
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Password is stored in plain text (legacy data), compare directly
      // This handles migration from old plain text passwords
      passwordMatch = user.password === password;
      
      // If login successful and password was plain text, hash it and update
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log(`Migrated password to hashed for user: ${user.email}`);
      }
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Don't send password back, but include phone
    const { password: _, ...userData } = user._doc;
    userData.phone = user.phone || '';

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
