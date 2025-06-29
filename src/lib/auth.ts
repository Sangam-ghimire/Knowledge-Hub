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
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      typeof (decoded as Record<string, unknown>).userId === 'string'
    ) {
      return { valid: true, decoded: decoded as AuthTokenPayload };
    }

    return { valid: false, decoded: null, error: 'Malformed token payload' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('JWT verification failed:', message);
    return { valid: false, decoded: null, error: message };
  }
}
