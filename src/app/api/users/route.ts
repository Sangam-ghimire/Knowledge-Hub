import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { email: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
