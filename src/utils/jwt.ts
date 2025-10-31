import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || '';

export interface TokenPayload {
  userId: string;
  role: string;
}

export function sign(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verify(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

