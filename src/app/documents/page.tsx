'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/types/document';
import SearchBar from '@/components/SearchBar';
import debounce from 'lodash.debounce';

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingSummaryId, setLoadingSummaryId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setDocuments(data.documents || []);
        setAllDocuments(data.documents || []);
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

    return () => controller.abort();
  }, [router]);

  const debouncedSearch = useRef(
    debounce(async (query: string, allDocs: Document[], setDocs: React.Dispatch<React.SetStateAction<Document[]>>) => {
      if (!query.trim()) {
        setDocs(allDocs);
        return;
      }

      const token = document.cookie
        .split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];
      if (!token) return;

      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setDocs(data.results || []);
        else console.error('Search error:', data.error);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 400)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (query: string) => {
    debouncedSearch(query, allDocuments, setDocuments);
  };

  const handleSummarize = (docId: string) => {
    setLoadingSummaryId(docId);
    setTimeout(() => {
      alert(`Summary for document ${docId} would appear here.`);
      setLoadingSummaryId(null);
    }, 1500);
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">📚 My Documents</h1>
        <Link
          href="/documents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ➕ Add Document
        </Link>
      </div>

      <SearchBar onSearchChange={handleSearchChange} />

      {loading ? (
        <p className="text-gray-400 mt-6">Loading your documents...</p>
      ) : error ? (
        <p className="text-red-500 mt-6">{error}</p>
      ) : documents.length === 0 ? (
        <p className="text-gray-600 mt-6">No documents found.</p>
      ) : (
        <ul className="space-y-4 mt-6">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="border p-4 rounded shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {doc.title}
                </Link>
                <button
                  type="button"
                  onClick={() => handleSummarize(doc.id)}
                  className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  disabled={loadingSummaryId === doc.id}
                >
                  {loadingSummaryId === doc.id ? 'Feature loading...' : 'Summarize'}
                </button>
              </div>
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
