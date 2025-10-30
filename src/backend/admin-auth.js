import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from "googleapis";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();


// load credentials from .env 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, REDIRECT_URI, GMAIL_SEND } = process.env;

// --- Create Gmail API client ---
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// --- Helper: Send email using Gmail API ---
async function sendGmailAPI({ from, to, subject, text, html }) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageParts = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html || text,
    ];

    const message = messageParts.join('\n');

    // Encode to base64url
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('Gmail API send success:', response.data.id);
    return response.data;
  } catch (err) {
    console.error('Gmail API send failed:', err);
    throw err;
  }
}

let otpStore = {}; // { email: { otp, expires } }
// Step 1: Password check and send OTP
router.post('/admin/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[ADMIN_EMAIL] = { otp, expires: Date.now() + 15 * 60 * 1000 }; // 15 min expiry

  try {
    // Send OTP email
    await sendGmailAPI({
      from: `"ExpressEase Admin" <${GMAIL_SEND}>`,
      to: ADMIN_EMAIL,
      subject: 'Your Admin OTP',
      text: `Your OTP is: ${otp}`
    });
    res.status(200).json({ message: 'OTP sent to admin email' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// Step 2: OTP check and issue JWT
router.post('/admin/verify-otp', (req, res) => {
  const { otp } = req.body;
  const record = otpStore[ADMIN_EMAIL];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  delete otpStore[ADMIN_EMAIL];

  // Issue JWT
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token });
});

// Middleware to protect admin routes
export function adminAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.admin) throw new Error();
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// contact from submit
router.post('/contact', async (req, res) => {
  const { name, email, msg } = req.body;
  // Validate input
  if (!name || !email || !msg) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Send email
    await sendGmailAPI({
      from: `"ExpressEase Contact" <${GMAIL_SEND}>`,
      to: SUPPORT_EMAIL,
      subject: `Contact Form Submission from ${name}`,
      html: `<div style="font-family:Arial,sans-serif; color:#333; line-height:1.5; padding:20px;">
          <p style="font-size:18px; font-weight:bold; margin-bottom:10px;">
            ${name} contacted us
          </p>

          <p style="margin:8px 0;">
            <strong>Name:</strong> ${name}
          </p>
          <p style="margin:8px 0;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="margin:8px 0;">
            <strong>Message:</strong><br/>
            ${msg.replace(/\n/g, '<br/>')}
          </p>

          <p style="margin-top:20px;">ExpressEase Team</p>
  </div>`
    });
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// footer contact btn
router.post('/footer/subscribe', async (req, res) => {
  const { email } = req.body;
  // Validate input
  if (!email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Send email
    await sendGmailAPI({
    from: `"ExpressEase Subscribe" <${GMAIL_SEND}>`,
      to: ADMIN_EMAIL,
      subject: 'User Subscribe to receive updates',
      text: `User with email ${email} has subscribed to receive updates.`
    });
    res.status(200).json({ message: 'Subscribed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send subscription email' });
  }
});

export default router;