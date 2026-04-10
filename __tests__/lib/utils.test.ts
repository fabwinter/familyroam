import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, slugify } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', null, undefined, '')).toBe('foo');
  });

  it('handles conditional class objects', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('returns an empty string when called with no args', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(10000)).toBe('$10,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('rounds to zero decimal places', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  it('formats EUR currency', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('1,000');
    expect(result).toContain('€');
  });
});

describe('slugify', () => {
  it('lowercases text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('strips accents from characters', () => {
    expect(slugify('Chiang Maï')).toBe('chiang-mai');
    expect(slugify('Málaga')).toBe('malaga');
    expect(slugify('São Paulo')).toBe('sao-paulo');
    expect(slugify('Zürich')).toBe('zurich');
  });

  it('removes non-alphanumeric characters', () => {
    // Apostrophe is treated as a separator, so "It's" → "it-s"
    expect(slugify("It's a test!")).toBe('it-s-a-test');
    expect(slugify('hello.world')).toBe('hello-world');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
    expect(slugify('-hello-')).toBe('hello');
  });

  it('handles already-slugified input idempotently', () => {
    expect(slugify('chiang-mai')).toBe('chiang-mai');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numbers', () => {
    expect(slugify('City 123')).toBe('city-123');
  });

  it('handles strings with only special characters', () => {
    expect(slugify('!@#$%')).toBe('');
  });
});
