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

  // Auto-share based on @mentions
  const rawMentions = content.match(/@([\w.-]+@[\w.-]+|\w+)/g) || [];
  const mentions: string[] = rawMentions.map((m: string) => m.slice(1));

  if (mentions.length > 0) {
    const usersToShare = await prisma.user.findMany({
      where: {
        OR: mentions.map((email: string) => ({
          email: { contains: email },
        })),
      },
    });

    const shares = usersToShare.map((u) => ({
      userId: u.id,
      documentId: doc.id,
      permission: 'VIEW',
    }));

    if (shares.length > 0) {
      await prisma.share.createMany({ data: shares, skipDuplicates: true });
    }
  }

  return NextResponse.json({ message: 'Document created', document: doc });
}

export async function PUT(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid } = verifyAuthToken(token); // decoded unused on purpose
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { id, title, content, isPublic } = await req.json();
  if (!id || !title || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      title,
      content,
      isPublic: isPublic || false,
    },
  });

  // Auto-share based on @mentions
  const rawMentions = content.match(/@([\w.-]+@[\w.-]+|\w+)/g) || [];
  const mentions: string[] = rawMentions.map((m: string) => m.slice(1));

  if (mentions.length > 0) {
    const usersToShare = await prisma.user.findMany({
      where: {
        OR: mentions.map((email: string) => ({
          email: { contains: email },
        })),
      },
    });

    const shares = usersToShare.map((u) => ({
      userId: u.id,
      documentId: updated.id,
      permission: 'VIEW',
    }));

    if (shares.length > 0) {
      await prisma.share.createMany({ data: shares, skipDuplicates: true });
    }
  }

  return NextResponse.json({ message: 'Document updated', document: updated });
}
