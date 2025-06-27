import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const { valid } = verifyAuthToken(token || '');
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const versions = await prisma.version.findMany({
    where: { documentId: params.id },
    orderBy: { editedAt: 'desc' },
  });

  return NextResponse.json({ versions });
}
