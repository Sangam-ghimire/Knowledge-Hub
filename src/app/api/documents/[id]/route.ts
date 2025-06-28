import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = params?.id;

  if (!documentId) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);

  if (!valid || !decoded || typeof decoded !== 'object') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decoded.userId as string;
  console.log('Decoded userId from token:', userId);

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        shares: {
          select: {
            id: true,
            userId: true,
            canEdit: true,
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isAuthor = doc.author?.id === userId;
    const isPublic = doc.isPublic;
    const isShared = doc.shares.some(s => s.userId === userId);

    if (!(isAuthor || isPublic || isShared)) {
      return NextResponse.json(
        { error: 'You do not have access to this private document.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      document: {
        ...doc,
      },
      currentUserId: userId,
    });
  } catch (err) {
    console.error('Error retrieving document:', err);
    return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = params?.id;

  if (!documentId) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { valid, decoded } = verifyAuthToken(token);

  if (!valid || !decoded || typeof decoded !== 'object') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decoded.userId as string;

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const content = body.content;
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        content: true,
        updatedAt: true,
        authorId: true,
        shares: {
          select: {
            userId: true,
            canEdit: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isAuthor = document.authorId === userId;
    const isSharedEditable = document.shares.some(
      (share) => share.userId === userId && share.canEdit === true
    );

    if (!isAuthor && !isSharedEditable) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err) {
    console.error('Error updating document:', err);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
