import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function DocumentPage(context: { params: { id: string } }) {
  const cookieStore = await cookies(); // ✅ must be awaited
  const token = cookieStore.get('token');

  if (!token?.value) {
    console.error('Missing token');
    return notFound();
  }

  const docId = context.params.id; // ✅ access from context, not destructuring params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/documents/${docId}`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type');
  if (!res.ok || !contentType?.includes('application/json')) {
    console.error(`Unexpected response. Status: ${res.status}, Content-Type: ${contentType}`);
    return notFound();
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error('Failed to parse JSON', err);
    return notFound();
  }

  const { document } = data;
  if (!document) {
    console.error('Document missing from response');
    return notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        By {document.author?.email} • Updated {new Date(document.updatedAt).toLocaleString()}
      </p>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />
    </main>
  );
}
