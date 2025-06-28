import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);
  if (!valid || !decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { email } = decoded as { email: string };
  return NextResponse.json({ email });
}
