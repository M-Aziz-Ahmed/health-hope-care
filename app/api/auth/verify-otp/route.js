import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/Users';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const identifier = (body.identifier || '').toString().trim();
    const code = (body.code || '').toString().trim();
    if (!identifier || !code) return NextResponse.json({ error: 'Identifier and code required' }, { status: 400 });

    // find latest unused otp for identifier
    const otp = await Otp.findOne({ identifier, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp) return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });

    const match = await bcrypt.compare(code, otp.codeHash);
    if (!match) {
      otp.attempts = (otp.attempts || 0) + 1;
      await otp.save();
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    otp.used = true;
    await otp.save();

    // find or create user — if OTP has registration meta, use it to create the account
    let user;
    if (otp.meta && typeof otp.meta === 'object' && (otp.meta.email || otp.meta.phone)) {
      const reg = otp.meta;
      const email = reg.email ? reg.email.toLowerCase() : null;
      const phone = reg.phone || null;

      // prefer email match
      if (email) user = await User.findOne({ email });
      if (!user && phone) user = await User.findOne({ phone });

      if (!user) {
        const createData = {
          name: reg.name || 'New User',
          role: reg.role || 'user',
          phone: phone || '',
        };
        if (email) createData.email = email;
        if (reg.passwordHash) createData.password = reg.passwordHash; // already hashed

        user = await User.create(createData);
      }
    } else {
      const isPhone = /^\+?[0-9]{7,15}$/.test(identifier);
      if (isPhone) {
        user = await User.findOne({ phone: identifier });
        if (!user) {
          user = await User.create({ name: 'New User', phone: identifier, role: 'user' });
        }
      } else {
        const email = identifier.toLowerCase();
        user = await User.findOne({ email });
        if (!user) {
          user = await User.create({ name: 'New User', email, role: 'user' });
        }
      }
    }

    // respond and set cookie like loginUser
    const { password: _, ...userData } = user._doc || user;
    const response = NextResponse.json(userData, { status: 200 });
    response.cookies.set('userId', user._id.toString(), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    console.error('Verify OTP error', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
