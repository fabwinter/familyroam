'use client';

import { useState } from 'react';

const AGE_RANGES = ['0–2', '3–5', '6–12', '13+'];

export default function ReviewForm({ cityId }: { cityId: string }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [kidsAges, setKidsAges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function toggleAge(range: string) {
    setKidsAges((prev) =>
      prev.includes(range) ? prev.filter((a) => a !== range) : [...prev, range]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityId,
        rating,
        title,
        body,
        visitedAt: visitedAt || null,
        familySize: familySize ? Number(familySize) : null,
        kidsAges,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Something went wrong.');
    }
  }

  if (done) {
    return (
      <p className="text-sm text-green-600 font-medium">
        Thanks for your review! It may take a moment to appear.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-muted'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="One-line summary"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your experience</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          placeholder="What was it like for your family?"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">When did you visit? (optional)</label>
        <input
          type="month"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Family size (optional)</label>
        <input
          type="number"
          min={1}
          max={20}
          value={familySize}
          onChange={(e) => setFamilySize(e.target.value)}
          placeholder="e.g. 4"
          className="w-32 rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Kids ages (optional)</label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => toggleAge(range)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                kidsAges.includes(range)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-input hover:bg-accent'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
