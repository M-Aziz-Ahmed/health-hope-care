import { connectDB } from "@/lib/db";
import User from "@/models/Users";
import { NextResponse } from "next/server";

export async function GET (){
    try {
        await connectDB();
        const users = await User.find()
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

}