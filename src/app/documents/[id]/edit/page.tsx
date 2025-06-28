'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';

export default function EditDocumentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) {
        alert('Failed to load document');
        router.push('/documents');
        return;
      }

      const { document } = await res.json();
      setTitle(document.title);
      setContent(document.content);
      setIsPublic(document.isPublic);
    };

    fetchDocument();
  }, [id, router]);

  const handleSave = async () => {
    setLoading(true);

    const res = await fetch('/api/documents', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ id, title, content, isPublic }),
    });

    setLoading(false);
    if (!res.ok) {
      alert('Failed to update document');
    } else {
      router.push(`/documents/${id}`);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Document</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Document Title"
      />

      <TiptapEditor content={content} onChange={setContent} />

      <label className="mt-4 inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public
      </label>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </main>
  );
}
