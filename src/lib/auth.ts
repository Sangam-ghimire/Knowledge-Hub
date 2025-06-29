import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in .env');
}

type AuthTokenPayload = {
  userId: string;
  email: string;
};

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): {
  valid: boolean;
  decoded: AuthTokenPayload | null;
  error?: string;
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return { valid: true, decoded };
  } catch (err: any) {
    console.error('JWT verification failed:', err.message);
    return { valid: false, decoded: null, error: err.message };
  }
}
