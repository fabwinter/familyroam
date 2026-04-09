'use client';

import { useState } from 'react';

export default function FilterSidebar() {
  const [maxCost, setMaxCost] = useState(5000);
  const [minSafety, setMinSafety] = useState(0);
  const [continent, setContinent] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Continent</h3>
        <select
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
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
          Max monthly cost: <span className="text-primary">${maxCost.toLocaleString()}</span>
        </h3>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={maxCost}
          onChange={(e) => setMaxCost(Number(e.target.value))}
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
          onChange={(e) => setMinSafety(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <button
        onClick={() => {
          setMaxCost(5000);
          setMinSafety(0);
          setContinent('');
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        Reset filters
      </button>
    </div>
  );
}
