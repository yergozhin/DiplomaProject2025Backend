import { Resend } from 'resend';
import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME ?? 'Diploma Project';

const resend = new Resend(RESEND_API_KEY);

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationLink(token: string): string {
  return `${FRONTEND_URL}/verify-email?token=${token}`;
}

export function getPasswordResetLink(token: string): string {
  return `${FRONTEND_URL}/reset-password?token=${token}`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const verificationLink = getVerificationLink(token);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
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
    });

    if (result.error) {
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to send verification email: ${errorMessage}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resetLink = getPasswordResetLink(token);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
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
    });

    if (result.error) {
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to send password reset email: ${errorMessage}`);
  }
}

