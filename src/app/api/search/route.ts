import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
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

    const userId = decoded.userId as string;

    const documents = await prisma.document.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { authorId: userId },
              { isPublic: true },
              { shares: { some: { userId } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        author: {
          select: { email: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ results: documents });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
