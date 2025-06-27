// lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in .env');
}

export function signAuthToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
}
export function verifyAuthToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    return { valid: true, decoded };
  } catch (err) {
    console.error('JWT verification failed:', err);
    return { valid: false, error: 'Invalid or expired token' };
  }
}
