// app/api/register/route.ts (or wherever you define it)
import { connectDB } from "@/lib/db";
import User from "@/models/Users";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { name, email, password, role } = data;

    // ✅ Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    // ✅ Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create and save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default to 'user' if role not provided
      phone: data.phone || '', // Optional phone number
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error("User registration failed:", error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
