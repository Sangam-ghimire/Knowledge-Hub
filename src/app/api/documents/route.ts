import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase();

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

  const docs = await prisma.document.findMany({
    where: {
      AND: [
        {
          OR: [
            { authorId: userId },
            { isPublic: true },
            { shares: { some: { userId } } },
          ],
        },
        query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    include: {
      author: { select: { email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ documents: docs });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');

  console.log('Auth Header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { title, content, isPublic } = await req.json();
  const userId = (decoded as { userId: string }).userId;

  if (!title || !content) {
    return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
  }

  const doc = await prisma.document.create({
    data: {
      title,
      content,
      isPublic: isPublic || false,
      authorId: userId,
    },
  });

  return NextResponse.json({ message: 'Document created', document: doc });
}
