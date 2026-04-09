import { describe, it, expect } from 'vitest';
import { computeFamilyScore } from '@/lib/scoring';

describe('computeFamilyScore', () => {
  it('returns null when all inputs are null', () => {
    expect(computeFamilyScore({})).toBeNull();
    expect(computeFamilyScore({ safetyScore: null, aqiAvg: null, costAvg: null })).toBeNull();
  });

  it('returns a number in the range [0, 100] with all inputs provided', () => {
    const score = computeFamilyScore({
      safetyScore: 80,
      aqiAvg: 50,
      costAvg: 3000,
      internetScore: 70,
      qualityOfLife: 75,
    });
    expect(score).not.toBeNull();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('computes correctly with only safetyScore present', () => {
    // Only safety (weight 0.35), normalised to 80/100 = 0.8
    // Weighted average = 0.8 → score = 80.0
    const score = computeFamilyScore({ safetyScore: 80 });
    expect(score).toBe(80);
  });

  it('computes correctly with only AQI present', () => {
    // AQI=0 → normalised = 1.0 → score = 100
    expect(computeFamilyScore({ aqiAvg: 0 })).toBe(100);
    // AQI=300 → normalised = 0 → score = 0
    expect(computeFamilyScore({ aqiAvg: 300 })).toBe(0);
    // AQI=150 → normalised = 0.5 → score = 50
    expect(computeFamilyScore({ aqiAvg: 150 })).toBe(50);
  });

  it('caps AQI above 300 to 0', () => {
    const score = computeFamilyScore({ aqiAvg: 500 });
    expect(score).toBe(0);
  });

  it('computes correctly with only costAvg present', () => {
    // costAvg=500 → affordability = 1 → score = 100
    expect(computeFamilyScore({ costAvg: 500 })).toBe(100);
    // costAvg=10000 → affordability = 0 → score = 0
    expect(computeFamilyScore({ costAvg: 10000 })).toBe(0);
    // costAvg=5250 → affordability = (10000-5250)/(10000-500) = 4750/9500 ≈ 0.5
    expect(computeFamilyScore({ costAvg: 5250 })).toBeCloseTo(50, 0);
  });

  it('clamps costAvg below minimum to 100', () => {
    expect(computeFamilyScore({ costAvg: 100 })).toBe(100);
  });

  it('computes correctly with only internetScore present', () => {
    expect(computeFamilyScore({ internetScore: 100 })).toBe(100);
    expect(computeFamilyScore({ internetScore: 0 })).toBe(0);
    expect(computeFamilyScore({ internetScore: 50 })).toBe(50);
  });

  it('computes correctly with only qualityOfLife present', () => {
    expect(computeFamilyScore({ qualityOfLife: 100 })).toBe(100);
    expect(computeFamilyScore({ qualityOfLife: 0 })).toBe(0);
    expect(computeFamilyScore({ qualityOfLife: 60 })).toBe(60);
  });

  it('clamps safetyScore above 100 to 100', () => {
    expect(computeFamilyScore({ safetyScore: 150 })).toBe(100);
  });

  it('clamps safetyScore below 0 to 0', () => {
    expect(computeFamilyScore({ safetyScore: -10 })).toBe(0);
  });

  it('re-normalises weights when some components are missing', () => {
    // safetyScore=80 (weight 0.35) + aqiAvg=0 (weight 0.25)
    // totalWeight = 0.6, weightedSum = 0.8*0.35 + 1.0*0.25 = 0.28+0.25 = 0.53
    // score = (0.53 / 0.6) * 100 ≈ 88.3
    const score = computeFamilyScore({ safetyScore: 80, aqiAvg: 0 });
    expect(score).toBeCloseTo(88.3, 0);
  });

  it('returns a value rounded to one decimal place', () => {
    const score = computeFamilyScore({
      safetyScore: 73,
      aqiAvg: 42,
      costAvg: 2800,
      internetScore: 65,
      qualityOfLife: 80,
    });
    expect(score).not.toBeNull();
    // Verify it is a multiple of 0.1 (one decimal place precision)
    expect(Math.round(score! * 10) % 1).toBe(0);
  });

  it('produces the same result for repeated calls with identical inputs (deterministic)', () => {
    const input = { safetyScore: 70, aqiAvg: 80, costAvg: 3500, internetScore: 60 };
    expect(computeFamilyScore(input)).toBe(computeFamilyScore(input));
  });
});
