'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [maxCost, setMaxCost] = useState(() => Number(searchParams.get('maxCost') ?? 10000));
  const [minSafety, setMinSafety] = useState(() => Number(searchParams.get('minSafety') ?? 0));
  const [continent, setContinent] = useState(() => searchParams.get('continent') ?? '');

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function buildParams(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const merged = { continent, maxCost: String(maxCost), minSafety: String(minSafety), ...overrides };
    if (merged.continent) p.set('continent', merged.continent);
    if (Number(merged.maxCost) < 10000) p.set('maxCost', merged.maxCost);
    if (Number(merged.minSafety) > 0) p.set('minSafety', merged.minSafety);
    return p.toString();
  }

  function handleContinentChange(value: string) {
    setContinent(value);
    router.push('/cities?' + buildParams({ continent: value }));
  }

  function handleSliderChange(field: 'maxCost' | 'minSafety', value: number) {
    if (field === 'maxCost') setMaxCost(value);
    else setMinSafety(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(
        '/cities?' +
          buildParams({ [field]: String(value) })
      );
    }, 500);
  }

  function reset() {
    setMaxCost(10000);
    setMinSafety(0);
    setContinent('');
    router.push('/cities');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Continent</h3>
        <select
          value={continent}
          onChange={(e) => handleContinentChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="europe">Europe</option>
          <option value="asia">Asia</option>
          <option value="americas">Americas</option>
          <option value="africa">Africa</option>
          <option value="oceania">Oceania</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">
          Max monthly cost:{' '}
          <span className="text-primary">
            {maxCost >= 10000 ? 'Any' : `$${maxCost.toLocaleString()}`}
          </span>
        </h3>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={maxCost}
          onChange={(e) => handleSliderChange('maxCost', Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">
          Min safety score: <span className="text-primary">{minSafety}</span>
        </h3>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minSafety}
          onChange={(e) => handleSliderChange('minSafety', Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <button
        onClick={reset}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        Reset filters
      </button>
    </div>
  );
}
