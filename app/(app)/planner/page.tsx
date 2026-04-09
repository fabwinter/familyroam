'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CityResult {
  id: string;
  slug: string;
  name: string;
  country: string;
  costAvg: number | null;
}

interface TripCity extends CityResult {
  arrivalDate: string;
  departureDate: string;
}

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function estimatedCost(city: TripCity) {
  if (!city.costAvg) return null;
  const days = daysBetween(city.arrivalDate, city.departureDate);
  return (city.costAvg / 30) * days;
}

export default function PlannerPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [trip, setTrip] = useState<TripCity[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('familyroam-trip');
    if (saved) {
      try { setTrip(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('familyroam-trip', JSON.stringify(trip));
  }, [trip]);

  const search = useCallback((q: string) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/cities/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
      setShowDropdown(true);
    }, 300);
  }, []);

  function addCity(city: CityResult) {
    if (trip.find((c) => c.id === city.id)) return;
    const today = new Date().toISOString().slice(0, 10);
    const next = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    setTrip((t) => [...t, { ...city, arrivalDate: today, departureDate: next }]);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }

  function removeCity(id: string) {
    setTrip((t) => t.filter((c) => c.id !== id));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setTrip((t) => { const a = [...t]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  }

  function moveDown(idx: number) {
    setTrip((t) => {
      if (idx >= t.length - 1) return t;
      const a = [...t]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
    });
  }

  function updateDate(id: string, field: 'arrivalDate' | 'departureDate', value: string) {
    setTrip((t) => t.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  const totalDays = trip.reduce((s, c) => s + daysBetween(c.arrivalDate, c.departureDate), 0);
  const totalCost = trip.reduce((s, c) => {
    const est = estimatedCost(c);
    return est != null ? s + est : s;
  }, 0);

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Trip Planner</h1>
      <p className="text-muted-foreground mb-8">
        Build your family&apos;s itinerary city by city. Changes are saved automatically.
      </p>

      {/* City search */}
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search for a city to add…"
          className="w-full rounded-md border bg-background px-4 py-3 text-sm"
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 rounded-md border bg-background shadow-lg">
            {results.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => addCity(city)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors flex justify-between"
              >
                <span>{city.name}</span>
                <span className="text-muted-foreground">{city.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trip list */}
      {trip.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Your planner is empty</h2>
          <p className="text-muted-foreground">Search for cities above to build your itinerary.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trip.map((city, idx) => {
            const days = daysBetween(city.arrivalDate, city.departureDate);
            const cost = estimatedCost(city);
            return (
              <div key={city.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{idx + 1}</span>
                      <h3 className="font-semibold">{city.name}</h3>
                      <span className="text-xs text-muted-foreground">{city.country}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Arrival</label>
                        <input
                          type="date"
                          value={city.arrivalDate}
                          onChange={(e) => updateDate(city.id, 'arrivalDate', e.target.value)}
                          className="rounded-md border bg-background px-2 py-1 text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Departure</label>
                        <input
                          type="date"
                          value={city.departureDate}
                          onChange={(e) => updateDate(city.id, 'departureDate', e.target.value)}
                          className="rounded-md border bg-background px-2 py-1 text-sm w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {days > 0 && <span>{days} days</span>}
                      {cost != null && cost > 0 && (
                        <span>~{formatCurrency(cost)} estimated</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="rounded p-1 text-sm hover:bg-accent disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === trip.length - 1}
                      className="rounded p-1 text-sm hover:bg-accent disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeCity(city.id)}
                      className="rounded p-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      aria-label="Remove city"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="rounded-lg border bg-muted/40 p-5 flex justify-between text-sm">
            <span className="text-muted-foreground">{trip.length} cities · {totalDays} total days</span>
            {totalCost > 0 && (
              <span className="font-medium">~{formatCurrency(totalCost)} estimated total</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
