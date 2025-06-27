// lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAuthToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}
