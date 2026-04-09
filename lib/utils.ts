import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Build an Unsplash image URL for a city using the official Unsplash API.
 *
 * Requires NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to be set.
 * Falls back to a deterministic placeholder from picsum.photos when the key
 * is not available (useful during local dev and testing).
 *
 * The Unsplash API returns a direct CDN image URL via the `urls.regular` field.
 * This helper returns a URL you can embed in an <img> tag after the API call;
 * use `fetchUnsplashCityImageUrl` for server-side ingestion instead.
 */
export function unsplashCityUrl(cityName: string, _country: string, width = 800, height = 480): string {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    const query = encodeURIComponent(`${cityName} city travel`);
    return `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}&w=${width}&h=${height}`;
  }
  // Deterministic picsum.photos placeholder — stable, free, no key required.
  const seed = encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Fetch a permanent Unsplash CDN image URL for a city.
 * Intended for server-side use in seed/ingest scripts where
 * UNSPLASH_ACCESS_KEY (non-public) can be used.
 *
 * Returns null when no key is set or the request fails.
 */
export async function fetchUnsplashCityImageUrl(
  cityName: string,
  country: string,
): Promise<string | null> {
  const accessKey =
    process.env.UNSPLASH_ACCESS_KEY ?? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const query = encodeURIComponent(`${cityName} ${country} city`);
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json() as { urls?: { regular?: string } };
    return data?.urls?.regular ?? null;
  } catch {
    return null;
  }
}
