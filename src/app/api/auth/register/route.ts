// src/app/api/auth/register/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    return NextResponse.json({ message: 'User registered', user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'User already exists or DB error' }, { status: 500 });
  }
}
