// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const token = await cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
  }

  const { valid, decoded } = verifyAuthToken(token);

  if (!valid || !decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { email, userId } = decoded as { email: string; userId: string };

  return NextResponse.json({ userId, email }, { status: 200 });
}
