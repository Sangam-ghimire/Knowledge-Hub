import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const documentId = params.id;
  const userId = (decoded as { userId: string }).userId;

  // Ensure the requester is the author
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.authorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const shares = await prisma.share.findMany({
    where: { documentId },
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json({ shares });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const documentId = params.id;
  const userId = (decoded as { userId: string }).userId;
  const { email, canEdit = false } = await req.json();

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.authorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const share = await prisma.share.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUser.id,
      },
    },
    update: { canEdit },
    create: {
      documentId,
      userId: targetUser.id,
      canEdit,
    },
  });

  return NextResponse.json({ message: 'Access granted', share });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const documentId = params.id;
  const userId = (decoded as { userId: string }).userId;
  const { email } = await req.json();

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.authorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.share.deleteMany({
    where: {
      documentId,
      userId: targetUser.id,
    },
  });

  return NextResponse.json({ message: 'Access removed' });
}
