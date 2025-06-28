'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Document = {
  id: string;
  title: string;
  updatedAt: string;
  author: { email: string };
  isPublic: boolean;
};

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch documents: ${res.status}`);
        }

        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Document fetch error:', err);
        setError('You are not authorized. Redirecting...');
        setTimeout(() => router.replace('/login'), 1500);
      }
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    return () => {
      controller.abort(); // clean up if component unmounts
    };
  }, [router]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading your documents...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Heading + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📚 My Documents</h1>
        <Link
          href="/documents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ➕ Add Document
        </Link>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <p className="text-gray-600">You haven’t created or received any documents yet.</p>
      ) : (
        <ul className="space-y-4">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="border p-4 rounded shadow hover:shadow-md transition"
            >
              <Link
                href={`/documents/${doc.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {doc.title}
              </Link>
              <div className="text-sm text-gray-500 mt-1">
                by {doc.author.email} • Updated{' '}
                {new Date(doc.updatedAt).toLocaleString()} •{' '}
                <span className={doc.isPublic ? 'text-green-600' : 'text-red-500'}>
                  {doc.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
