import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = (decoded as { userId: string }).userId;

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
    include: {
      author: { select: { email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ results: documents });
}
