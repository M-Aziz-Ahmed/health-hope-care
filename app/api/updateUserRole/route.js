import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const requesterId = cookieStore.get('userId')?.value;
    if (!requesterId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const requester = await User.findById(requesterId).select('role');
    if (!requester) return NextResponse.json({ error: 'Requester not found' }, { status: 404 });

    const { userId, role } = await request.json();
    if (!userId || !role) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    // Only owner can assign owner role
    if (role === 'owner' && requester.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can assign owner role' }, { status: 403 });
    }

    const target = await User.findById(userId).select('role');
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    // Admins cannot demote an owner
    if (target.role === 'owner' && requester.role !== 'owner') {
      return NextResponse.json({ error: 'Cannot change role of the owner' }, { status: 403 });
    }

    // Only admin or owner can change roles
    if (!(requester.role === 'admin' || requester.role === 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    target.role = role;
    await target.save();

    return NextResponse.json({ success: true, role: target.role }, { status: 200 });
  } catch (error) {
    console.error('Failed to update user role', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
