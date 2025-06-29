'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4">📄 Create. Share. Collaborate.</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Welcome to your minimal document collaboration tool. Quickly draft, edit, and share documents with your team or the world.
        </p>

        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Register
            </Link>
          </div>
        ) : (
          <Link
            href="/documents"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to My Documents
          </Link>
        )}
      </div>
    </main>
  );
}
