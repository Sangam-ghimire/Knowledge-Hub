'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@/components/Editor';

export default function EditDocumentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Loading...</p>');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!id || !token) return;

    const fetchDoc = async () => {
      const res = await fetch(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setTitle(data.title);
        setContent(data.content);
        setIsPublic(data.isPublic);
      } else {
        alert(data.error || 'Error loading document');
        router.push('/documents');
      }
    };

    fetchDoc();
  }, [id, token]);

  const handleSave = async () => {
    setSaving(true);

    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, isPublic }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Saved!');
    } else {
      alert(data.error || 'Failed to save');
    }

    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Edit Document</h1>

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
        Public
      </label>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

