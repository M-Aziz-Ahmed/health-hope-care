import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Priority: Gmail app password (GMAIL_USER + GMAIL_APP_PASSWORD)
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailAppPassword) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailAppPassword }
    });
    return transporter;
  }

  // Fallback to generic SMTP settings
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host || !user || !pass) {
    // transporter remains null when not configured
    return null;
  }

  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transporter;
}

export async function sendMail(to, subject, text, html) {
  try {
    const t = getTransporter();
    if (!t) {
      console.warn('SMTP/Gmail not configured — sendMail skipped');
      return false;
    }

    const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
    await t.sendMail({ from, to, subject, text, html });
    return true;
  } catch (err) {
    console.warn('sendMail error:', err?.message || err);
    return false;
  }
}

export default sendMail;
