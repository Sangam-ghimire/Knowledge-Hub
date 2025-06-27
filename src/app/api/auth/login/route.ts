// src/app/api/auth/login/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = signAuthToken({ userId: user.id, email: user.email });

  return NextResponse.json({ message: 'Login successful', token });
}
