'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import { useRouter } from 'next/navigation';

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Start writing...</p>');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // make sure token is stored on login

    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, isPublic }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/documents');
    } else {
      alert(data.error || 'Failed to create document');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">New Document</h1>

      <input
        type="text"
        placeholder="Document title"
        className="w-full border px-4 py-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Editor content={content} onChange={setContent} />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Make public
      </label>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Document'}
      </button>
    </div>
  );
}
