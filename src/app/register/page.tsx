'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Auto-login after register
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token);
        router.push('/documents');
      } else {
        setError('Registered but login failed');
      }
    } else {
      setError(data.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-semibold">Register</h1>

      <input
        className="w-full border px-3 py-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border px-3 py-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        className="bg-green-600 text-white w-full py-2 rounded"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
}
