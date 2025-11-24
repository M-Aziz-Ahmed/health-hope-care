import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const service = await Service.findByIdAndUpdate(id, body, { new: true });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
