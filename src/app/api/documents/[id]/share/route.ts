// // src/app/api/documents/[id]/share/route.ts

// import { PrismaClient } from '@prisma/client';
// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { verifyAuthToken } from '@/lib/auth';

// const prisma = new PrismaClient();

// // GET: Get share list
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { valid, decoded } = verifyAuthToken(token);
//     if (!valid || !decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const userId = decoded.userId;
//     const documentId = params.id;

//     const doc = await prisma.document.findUnique({ where: { id: documentId } });
//     if (!doc || doc.authorId !== userId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const shares = await prisma.share.findMany({
//       where: { documentId },
//       include: { user: { select: { email: true } } },
//     });

//     return NextResponse.json({ shares });
//   } catch (err) {
//     console.error('GET share error:', err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// // POST: Share with user(s)
// export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { valid, decoded } = verifyAuthToken(token);
//     if (!valid || !decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const userId = decoded.userId;
//     const documentId = params.id;
//     const { mentions = [], email, canEdit = false } = await req.json();

//     const doc = await prisma.document.findUnique({ where: { id: documentId } });
//     if (!doc || doc.authorId !== userId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const emailsToShare = email ? [email] : mentions;
//     if (!emailsToShare || emailsToShare.length === 0) {
//       return NextResponse.json({ error: 'No valid recipients' }, { status: 400 });
//     }

//     const sharedWith: string[] = [];

//     for (const email of emailsToShare) {
//       const targetUser = await prisma.user.findUnique({ where: { email } });
//       if (!targetUser) continue;

//       await prisma.share.upsert({
//         where: {
//           documentId_userId: {
//             documentId,
//             userId: targetUser.id,
//           },
//         },
//         update: { canEdit },
//         create: {
//           documentId,
//           userId: targetUser.id,
//           canEdit,
//         },
//       });

//       sharedWith.push(email);
//     }

//     return NextResponse.json({ message: 'Access granted', sharedWith });
//   } catch (err) {
//     console.error('POST share error:', err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// // DELETE: Remove share
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { valid, decoded } = verifyAuthToken(token);
//     if (!valid || !decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const userId = decoded.userId;
//     const documentId = params.id;
//     const { email } = await req.json();

//     if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

//     const doc = await prisma.document.findUnique({ where: { id: documentId } });
//     if (!doc || doc.authorId !== userId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const targetUser = await prisma.user.findUnique({ where: { email } });
//     if (!targetUser) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     await prisma.share.deleteMany({
//       where: {
//         documentId,
//         userId: targetUser.id,
//       },
//     });

//     return NextResponse.json({ message: 'Access removed' });
//   } catch (err) {
//     console.error('DELETE share error:', err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


// src/app/api/documents/[id]/share/route.ts

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Get share list
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, decoded } = verifyAuthToken(token);
    if (!valid || !decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const documentId = params.id;

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const shares = await prisma.share.findMany({
      where: { documentId },
      include: { user: { select: { email: true, id: true } } },
    });

    // Exclude the author from the share list
    const filteredShares = shares.filter((share) => share.userId !== doc.authorId);

    return NextResponse.json({ shares: filteredShares });
  } catch (err) {
    console.error('GET share error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Share with user(s)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    const documentId = params.id;
    const { mentions = [], email, canEdit = false } = await req.json();

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const emailsToShare = email ? [email] : mentions;
    if (!emailsToShare || emailsToShare.length === 0) {
      return NextResponse.json({ error: 'No valid recipients' }, { status: 400 });
    }

    const sharedWith: string[] = [];

    for (const email of emailsToShare) {
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) continue;

      await prisma.share.upsert({
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

      sharedWith.push(email);
    }

    return NextResponse.json({ message: 'Access granted', sharedWith });
  } catch (err) {
    console.error('POST share error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove share
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    const documentId = params.id;
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

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
  } catch (err) {
    console.error('DELETE share error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
