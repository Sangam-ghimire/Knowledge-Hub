'use client';

import { useState } from 'react';

type Props = {
  onSearchChange: (query: string) => void;
};

export default function SearchBar({ onSearchChange }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onSearchChange(value);
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="🔍 Search documents by title or content..."
      />
    </div>
  );
}
