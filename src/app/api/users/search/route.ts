import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { valid, decoded } = verifyAuthToken(token);

    if (!valid || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUserId = decoded.userId as string;

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: q,
          mode: 'insensitive',
        },
        NOT: {
          id: currentUserId, //  prevent suggesting the current user
        },
      },
      select: {
        email: true,
      },
      take: 10,
    });

    return NextResponse.json({ users: users.map((u) => u.email) });
  } catch (error) {
    console.error('User Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
