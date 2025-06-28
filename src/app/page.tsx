'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.email) setUserEmail(data.email);
      });
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome {userEmail ? userEmail : '👋'}</h1>
      <p className="text-gray-600 mb-8">
        This is your Knowledge Hub. Create, collaborate, and organize documents with your team.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/documents/new"
          className="bg-blue-600 text-white p-4 rounded-xl shadow hover:bg-blue-700 transition"
        >
          📄 Create New Document
        </Link>
        <Link
          href="/documents"
          className="bg-gray-100 p-4 rounded-xl shadow hover:bg-gray-200 transition"
        >
          📚 View My Documents
        </Link>
      </div>

      <div className="mt-10 border-t pt-6 text-sm text-gray-500">
        💡 Tip: Mention teammates with <code>@username</code> to auto-share documents.
      </div>
    </main>
  );
}
