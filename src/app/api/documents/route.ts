import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      console.warn('No token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, decoded } = verifyAuthToken(token);
    if (!valid || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      console.warn('Invalid token or missing userId in decoded payload:', decoded);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn('No user found for userId:', userId);
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
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (err) {
    console.error('GET /api/documents error:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
