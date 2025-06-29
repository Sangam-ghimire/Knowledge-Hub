import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal whether user exists
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Generate secure token
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Optionally: delete existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: expires,
    },
  });

  // Send email
  await sendResetEmail(user.email, token);

  return NextResponse.json({ success: true });
}
