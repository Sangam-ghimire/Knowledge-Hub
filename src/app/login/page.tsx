'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important: uses HTTP-only cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/documents');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">🔐 Login</h1>

      <input
        type="email"
        placeholder="Your email"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        aria-label="Email"
      />
      <input
        type="password"
        placeholder="Your password"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        aria-label="Password"
      />

      {error && (
        <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full py-2 text-white font-medium rounded ${
          loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        } transition`}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </main>
  );
}
