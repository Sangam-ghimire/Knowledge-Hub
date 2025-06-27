'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@/components/Editor';

type Version = {
  id: string;
  content: string;
  editedAt: string;
  editorId: string;
};

export default function EditDocumentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Loading...</p>');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const [versions, setVersions] = useState<Version[]>([]);
  const [viewingVersion, setViewingVersion] = useState<string | null>(null);

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

    const fetchVersions = async () => {
      const res = await fetch(`/api/documents/${id}/versions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setVersions(data.versions);
      }
    };

    fetchDoc();
    fetchVersions();
  }, [id, token, router]);

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
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
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

      {/* Version History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Version History</h2>
        <ul className="space-y-2 text-sm">
          {versions.map((v) => (
            <li key={v.id} className="border p-2 rounded">
              <div className="flex justify-between items-center">
                <span>{new Date(v.editedAt).toLocaleString()}</span>
                <button
                  onClick={() =>
                    setViewingVersion(viewingVersion === v.id ? null : v.id)
                  }
                  className="text-blue-600 text-xs underline"
                >
                  {viewingVersion === v.id ? 'Hide' : 'View'}
                </button>
              </div>
              {viewingVersion === v.id && (
                <div
                  className="mt-2 border-t pt-2 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: v.content }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
