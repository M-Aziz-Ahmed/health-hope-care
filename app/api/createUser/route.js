import { connectDB } from "@/lib/db";
import { User } from "@/models/Users";
import { NextResponse } from "next/server";

export async function POST (request){
    try {
        await connectDB();
        const data = await request.json();
        const newUser = new User(data);
        await newUser.save();
        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}