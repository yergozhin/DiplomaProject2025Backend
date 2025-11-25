import nodemailer from 'nodemailer';
import crypto from 'crypto';

function getSmtpConfig() {
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587');
  const SMTP_USER = process.env.SMTP_USER ?? '';
  const SMTP_PASS = process.env.SMTP_PASS ?? '';
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const APP_NAME = process.env.APP_NAME ?? 'Diploma Project';

  return { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FRONTEND_URL, APP_NAME };
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = getSmtpConfig();
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Some SMTP servers require this in production
    },
  });
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationLink(token: string): string {
  const { FRONTEND_URL } = getSmtpConfig();
  return `${FRONTEND_URL}/verify-email?token=${token}`;
}

export function getPasswordResetLink(token: string): string {
  const { FRONTEND_URL } = getSmtpConfig();
  return `${FRONTEND_URL}/reset-password?token=${token}`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, APP_NAME } = getSmtpConfig();
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('SMTP configuration check:', {
      SMTP_USER: SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: SMTP_PASS ? 'SET' : 'NOT SET',
      SMTP_HOST,
      SMTP_PORT,
      NODE_ENV: process.env.NODE_ENV,
    });
    throw new Error('SMTP is not configured: SMTP_USER or SMTP_PASS is missing');
  }

  const transporter = createTransporter();
  const verificationLink = getVerificationLink(token);

  const mailOptions = {
    from: `"${APP_NAME}" <${SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${APP_NAME}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
    text: `Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('SMTP send error:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, APP_NAME } = getSmtpConfig();
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('SMTP configuration check:', {
      SMTP_USER: SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: SMTP_PASS ? 'SET' : 'NOT SET',
      SMTP_HOST,
      SMTP_PORT,
      NODE_ENV: process.env.NODE_ENV,
    });
    throw new Error('SMTP is not configured: SMTP_USER or SMTP_PASS is missing');
  }

  const transporter = createTransporter();
  const resetLink = getPasswordResetLink(token);

  const mailOptions = {
    from: `"${APP_NAME}" <${SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `You requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('SMTP send error:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    throw error;
  }
}

