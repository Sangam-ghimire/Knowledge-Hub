'use client';

import { useEffect, useState, useRef } from 'react';

type Props = {
  documentId: string;
};

type User = {
  id: string;
  email: string;
};

export default function MentionSidebar({ documentId }: Props) {
  const [input, setInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetch('/api/users/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          setFiltered(data.users);
        }
      })
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    setHighlighted(-1);

    if (!value.trim()) {
      setFiltered(users);
      return;
    }

    const lower = value.toLowerCase();
    setFiltered(users.filter(user => user.email.toLowerCase().includes(lower)));
  };

  const handleAdd = (email?: string) => {
    const clean = (email || input).trim();
    if (clean && !mentions.includes(clean)) {
      setMentions(prev => [...prev, clean]);
    }
    setInput('');
    setFiltered(users);
    setHighlighted(-1);
  };

  const handleRemoveMention = (email: string) => {
    setMentions(prev => prev.filter(m => m !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(prev => (prev + 1) % filtered.length);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(prev => (prev - 1 + filtered.length) % filtered.length);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0) {
        handleAdd(filtered[highlighted].email);
      } else {
        handleAdd();
      }
    }
  };

  const handleShare = async () => {
    if (mentions.length === 0) {
      alert('No mentions to share with.');
      return;
    }

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      alert('User not authenticated.');
      return;
    }

    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentions }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Share failed:', data.error);
        alert('Failed to share document.');
      } else {
        alert(`Shared with: ${data.sharedWith.join(', ')}`);
        setMentions([]);
      }
    } catch (err) {
      console.error('Share error:', err);
      alert('An error occurred while sharing.');
    }
  };

  useEffect(() => {
    if (
      highlighted >= 0 &&
      listRef.current &&
      listRef.current.children[highlighted]
    ) {
      (listRef.current.children[highlighted] as HTMLLIElement).scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlighted]);

  return (
<div className="bg-zinc-900 text-white p-4 w-72 h-full shadow-lg space-y-4 rounded-md flex flex-col" style={{ minHeight: '400px', maxHeight: '80vh' }}>
  <h2 className="text-lg font-semibold flex items-center gap-2">
    <span>🔗</span> Share With
  </h2>

  {/* Selected mentions pills */}
  <div className="flex flex-wrap gap-2 min-h-[2.5rem] max-h-24 overflow-y-auto">
    {mentions.map((m) => (
      <div
        key={m}
        className="bg-blue-600 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
      >
        <span>{m}</span>
        <button
          onClick={() => handleRemoveMention(m)}
          className="text-white hover:text-gray-300"
          aria-label="Remove"
          type="button"
        >
          ✕
        </button>
      </div>
    ))}
  </div>

  {/* Input + dropdown container */}
  <div className="relative flex-grow overflow-hidden">
    <input
      value={input}
      onChange={(e) => handleInputChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="@username or email"
      className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {filtered.length > 0 && (
      <ul
        ref={listRef}
        className="absolute z-30 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        style={{ maxHeight: 'calc(80vh - 200px)' }} // adjust this if needed
      >
        {filtered.map((user, i) => (
          <li
            key={user.id}
            onClick={() => handleAdd(user.email)}
            className={`flex items-center px-4 py-2 cursor-pointer transition ${
              i === highlighted
                ? 'bg-blue-600 text-white'
                : 'hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white mr-3">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{user.email}</span>
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Share button fixed at bottom */}
  <button
    onClick={handleShare}
    className="mt-4 bg-blue-600 hover:bg-blue-700 w-full py-2 rounded text-sm font-medium"
    type="button"
  >
    Share Mentions
  </button>
</div>

  );
}
