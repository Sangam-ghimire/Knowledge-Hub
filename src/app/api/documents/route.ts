import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Step 1: Get token from cookies
  const token = req.cookies.get('token')?.value;

  if (!token) {
    console.warn(' No token found in cookies');
    return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
  }

  // Step 2: Decode and validate token
  const { valid, decoded } = verifyAuthToken(token);

  if (!valid || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
    console.warn(' Invalid token or missing userId in decoded payload:', decoded);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decoded.userId as string;

  try {
    // Step 3: Validate user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.warn(' No user found for userId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Step 4: Fetch accessible documents
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { isPublic: true },               // Public documents
          { authorId: userId },             // Documents created by the user
          { shares: { some: { userId } } }, // Documents shared with the user
        ],
      },
      include: {
        author: { select: { id: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Step 5: Respond with documents
    return NextResponse.json({ documents });

  } catch (err) {
    console.error(' Error fetching documents:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
