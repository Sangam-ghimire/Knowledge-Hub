import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || typeof token !== 'string' || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Invalid token or password too short' }, { status: 400 });
  }

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { password: hashed },
  });

  // Clean up token
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
