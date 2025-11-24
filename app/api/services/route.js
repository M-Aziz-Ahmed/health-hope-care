import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({}).sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const service = await Service.create(body);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
