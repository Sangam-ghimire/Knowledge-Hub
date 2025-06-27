import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const { valid } = verifyAuthToken(token || '');

  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
  });

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  return NextResponse.json(doc);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token || '');

  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, isPublic } = await req.json();
  const userId = (decoded as { userId: string }).userId;

  const doc = await prisma.document.findUnique({ where: { id: params.id } });

  if (!doc || doc.authorId !== userId) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const updated = await prisma.document.update({
    where: { id: params.id },
    data: { title, content, isPublic },
  });

  return NextResponse.json(updated);
}
