import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in .env');
}

type AuthTokenPayload = {
  userId: string;
  // Extend with additional fields if needed
} & Record<string, unknown>;

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): {
  valid: boolean;
  decoded: AuthTokenPayload | null;
  error?: string;
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      typeof (decoded as Record<string, unknown>).userId === 'string'
    ) {
      console.log('Decoded JWT:', decoded);
      return { valid: true, decoded: decoded as AuthTokenPayload };
    } else {
      console.warn('JWT decoded but missing userId:', decoded);
      return { valid: false, decoded: null, error: 'Malformed token' };
    }
  } catch (err: unknown) {
    console.error('JWT verification failed:', err);
    return { valid: false, decoded: null, error: 'Invalid or expired token' };
  }
}
