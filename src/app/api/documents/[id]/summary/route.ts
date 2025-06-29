// src/app/api/documents/[id]/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { valid, decoded } = verifyAuthToken(token);
    if (!valid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = decoded.userId;
    const docId = params.id;

    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Permission check: author, shared with, or public
    const canAccess =
      doc.authorId === userId ||
      doc.isPublic ||
      (await prisma.share.findFirst({ where: { documentId: docId, userId } }));

    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Call OpenAI summarization
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or any available summarization-capable model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes documents in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `Summarize this document briefly:\n\n${doc.content}`,
        },
      ],
      max_tokens: 150,
    });

    const summary = response.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
