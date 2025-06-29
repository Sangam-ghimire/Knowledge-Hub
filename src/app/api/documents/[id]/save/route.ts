// src/app/api/documents/[id]/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { valid, decoded } = verifyAuthToken(token);
  if (!valid || !decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decoded.userId;

  //  Extract `id` from URL path
  const url = new URL(req.url);
  const docId = url.pathname.split('/')[3]; // assuming route = /api/documents/[id]/save

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { shares: true },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const isAuthor = doc.authorId === userId;
  const isSharedEditable = doc.shares.some((s) => s.userId === userId && s.canEdit);

  if (!isAuthor && !isSharedEditable) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.document.update({
    where: { id: docId },
    data: {
      content,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, updated });
}
