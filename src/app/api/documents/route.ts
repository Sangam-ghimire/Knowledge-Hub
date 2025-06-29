import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    console.log('[API] Token from cookies:', token);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, decoded, error } = verifyAuthToken(token);
    console.log('[API] Token verification result:', { valid, decoded, error });

    if (!valid || !decoded || typeof decoded.userId !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { isPublic: true },
          { authorId: userId },
          { shares: { some: { userId } } },
        ],
      },
      include: {
        author: { select: { id: true, email: true } },
        shares: {
          where: { userId },
          select: { userId: true, canEdit: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ documents, currentUserId: userId }, { status: 200 });
  } catch (err) {
    console.error('GET /api/documents error:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
