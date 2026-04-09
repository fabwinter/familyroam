'use client';

import { useState } from 'react';

export default function SaveCityButton({
  cityId,
  initialSaved = false,
}: {
  cityId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const method = saved ? 'DELETE' : 'POST';
    const res = await fetch('/api/saved-cities', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityId }),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(!saved);
    } else if (res.status === 401) {
      window.location.href = '/auth/login';
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Unsave city' : 'Save city'}
      className={`absolute top-2 right-2 rounded-full p-1.5 text-sm shadow transition-colors ${
        saved
          ? 'bg-primary text-primary-foreground'
          : 'bg-background/80 text-muted-foreground hover:text-foreground'
      } disabled:opacity-50`}
    >
      {saved ? '🔖' : '🏷'}
    </button>
  );
}
