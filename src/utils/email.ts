import mailjet from 'node-mailjet';
import * as crypto from 'crypto';

const MAILJET_API_KEY = process.env.MAILJET_API_KEY ?? '';
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY ?? '';
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL ?? '';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME ?? 'Diploma Project';

const mailjetClient = mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);

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
  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY must be configured');
  }

  if (!MAILJET_FROM_EMAIL) {
    throw new Error('MAILJET_FROM_EMAIL must be configured');
  }

  const verificationLink = getVerificationLink(token);

  try {
    await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: MAILJET_FROM_EMAIL,
              Name: APP_NAME,
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: 'Verify Your Email Address',
            HTMLPart: `
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
            TextPart: `Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.`,
          },
        ],
      });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to send verification email: ${errorMessage}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY must be configured');
  }

  if (!MAILJET_FROM_EMAIL) {
    throw new Error('MAILJET_FROM_EMAIL must be configured');
  }

  const resetLink = getPasswordResetLink(token);

  try {
    await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: MAILJET_FROM_EMAIL,
              Name: APP_NAME,
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: 'Reset Your Password',
            HTMLPart: `
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
            TextPart: `You requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
          },
        ],
      });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to send password reset email: ${errorMessage}`);
  }
}

