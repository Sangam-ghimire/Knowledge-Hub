'use client';

import { useEffect, useState } from 'react';

type Share = {
  user: { email: string };
  canEdit: boolean;
};

export default function SharePanel({
  documentId,
  token,
}: {
  documentId: string;
  token: string;
}) {
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchShares = async () => {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setShares(data.shares);
    };

    fetchShares();
  }, [token, documentId]);

  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, canEdit }),
    });
    if (res.ok) {
      setEmail('');
      setCanEdit(false);
      // Re-fetch shares after adding
      const updatedRes = await fetch(`/api/documents/${documentId}/share`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      if (updatedRes.ok) setShares(updatedData.shares);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to share');
    }
    setLoading(false);
  };

  const handleRemove = async (targetEmail: string) => {
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: targetEmail }),
    });
    if (res.ok) {
      // Re-fetch shares after removing
      const updatedRes = await fetch(`/api/documents/${documentId}/share`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      if (updatedRes.ok) setShares(updatedData.shares);
    }
  };

  return (
    <div className="border p-4 rounded mt-6">
      <h2 className="font-bold mb-2">Sharing Settings</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Enter user email"
          className="border px-2 py-1 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={canEdit}
            onChange={(e) => setCanEdit(e.target.checked)}
          />
          Edit
        </label>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded"
          disabled={loading || !email}
        >
          Share
        </button>
      </div>

      <ul className="space-y-2">
        {shares.map((share, index) => (
          <li key={index} className="flex justify-between items-center border-b pb-1">
            <div>
              <span className="font-medium">{share.user.email}</span>
              {share.canEdit ? ' (Editor)' : ' (Viewer)'}
            </div>
            <button
              onClick={() => handleRemove(share.user.email)}
              className="text-red-500 hover:underline text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
