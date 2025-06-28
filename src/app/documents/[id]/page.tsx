import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { FetchedDocumentData } from '@/types/document';
import DocumentEditorClient from '@/components/DocumentEditorClient';

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies(); // No await needed
  const tokenValue = cookieStore.get('token');

  if (!tokenValue?.value) {
    console.error('Missing token in cookies');
    return notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/documents/${params.id}`, {
    headers: {
      Authorization: `Bearer ${tokenValue.value}`,
    },
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type');
  if (!res.ok || !contentType?.includes('application/json')) {
    console.error(`Unexpected response. Status: ${res.status}, Content-Type: ${contentType}`);
    return notFound();
  }

  let data: FetchedDocumentData;
  try {
    data = await res.json();
  } catch (err) {
    console.error('Failed to parse JSON', err);
    return notFound();
  }

  const { document, currentUserId } = data;

  if (!document) {
    console.error('Document not found in API response');
    return notFound();
  }

  const isAuthor = document.author?.id === currentUserId;
  const isSharedEditable = document.shares?.some(
    (s) => s.userId === currentUserId && s.canEdit
  );
  const isPublic = document.isPublic;
  const canEdit = Boolean(isAuthor || isSharedEditable || isPublic);

  console.log({
    currentUserId,
    authorId: document.author?.id,
    shares: document.shares,
    isAuthor,
    isSharedEditable,
    canEdit,
  });

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-screen-md">
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        <p className="text-sm text-gray-400 mb-6">
          By {document.author?.email || 'Unknown'} • Updated{' '}
          {new Date(document.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="bg-[#1a1a1a] shadow-md w-full max-w-screen-md p-10 rounded-lg">
        <DocumentEditorClient
          content={document.content}
          documentId={document.id}
          readOnly={!canEdit}
        />
      </div>
    </main>
  );
}
