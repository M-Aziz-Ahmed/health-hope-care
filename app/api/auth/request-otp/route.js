import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/Users';
import bcrypt from 'bcryptjs';
import { sendMail } from '@/lib/mail';

async function sendSms(phone, message) {
  // optional Twilio support if env vars provided
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return false;
  try {
    const twilio = require('twilio')(sid, token);
    await twilio.messages.create({ body: message, from, to: phone });
    return true;
  } catch (e) {
    console.warn('Twilio send failed', e?.message || e);
    return false;
  }
}

// use centralized mail helper (sendMail) for SMTP sending

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const identifier = (body.identifier || '').toString().trim();
    if (!identifier) return NextResponse.json({ error: 'Identifier required' }, { status: 400 });

    // generate code and hash it
    const code = generateOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + (Number(process.env.OTP_TTL_SECONDS || 600) * 1000)); // default 10m

    // If registration object present, prepare meta (hash password) and store it on OTP
    let meta = null;
    if (body.registration && typeof body.registration === 'object') {
      const reg = { ...body.registration };
      if (reg.password) {
        // hash password before saving to meta
        try { reg.passwordHash = await bcrypt.hash(reg.password, 10); } catch (e) { reg.passwordHash = null; }
        delete reg.password;
      }
      meta = reg;
    }

    // Save OTP with optional meta
    await Otp.create({ identifier, codeHash, expiresAt, meta });

    // Send via SMS if looks like phone, else email
    const isPhone = /^\+?[0-9]{7,15}$/.test(identifier);
    const message = `Your verification code is: ${code}. It expires in ${Math.round((expiresAt - Date.now())/60000)} minutes.`;
    let sent = false;
    if (isPhone) {
      sent = await sendSms(identifier, message);
    } else {
      sent = await sendMail(identifier, 'Your verification code', message);
    }

    // If sending failed, still return ok to avoid leaking existence, but log a warning
    if (!sent) console.warn('OTP not sent. Missing provider or send failed for', identifier);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Request OTP error', error);
    return NextResponse.json({ error: 'Failed to request OTP' }, { status: 500 });
  }
}
