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
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // FIX: Ensure we explicitly check authorId here
    const isAuthor = doc.author?.id === userId;
    const isPublic = doc.isPublic;
    const isShared = doc.shares.length > 0;

    if (!(isAuthor || isPublic || isShared)) {
      return NextResponse.json(
        { error: 'You do not have access to this private document.' },
        { status: 403 }
      );
    }


    const { shares, ...docWithoutShares } = doc;
    void shares; 

    return NextResponse.json({ document: docWithoutShares });
  } catch (err) {
    console.error('Error retrieving document:', err);
    return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
  }
}
