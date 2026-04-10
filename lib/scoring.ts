/**
 * lib/scoring.ts
 *
 * Deterministic v1 family score calculation (0–100).
 *
 * Weights
 * -------
 * Safety score   35 %  — direct 0-100 field
 * Air quality    25 %  — AQI inverted: AQI 0 → 100pts, AQI 300+ → 0pts
 * Cost of living 15 %  — inverted: $500/mo → 100pts, $10 000/mo → 0pts
 * Internet speed 15 %  — direct 0-100 field
 * Quality of life 10 % — direct 0-100 field
 *
 * Any missing component is excluded and remaining weights are re-normalised
 * so partial data still yields a useful score.  Returns null only when ALL
 * components are absent.
 */

export interface ScoringInput {
  safetyScore?: number | null;
  aqiAvg?: number | null;
  costAvg?: number | null;
  internetScore?: number | null;
  qualityOfLife?: number | null;
}

interface WeightedComponent {
  value: number; // normalised 0-1
  weight: number;
}

/** Normalise AQI (US EPA scale) to a 0–1 "clean air" score. */
function normaliseAqi(aqi: number): number {
  // AQI 0 = perfect, 300+ = hazardous
  return Math.max(0, Math.min(1, (300 - aqi) / 300));
}

/** Normalise monthly cost (USD) to a 0–1 "affordability" score. */
function normaliseCost(costAvg: number): number {
  const MIN_COST = 500;
  const MAX_COST = 10_000;
  if (costAvg <= MIN_COST) return 1;
  if (costAvg >= MAX_COST) return 0;
  return (MAX_COST - costAvg) / (MAX_COST - MIN_COST);
}

/**
 * Compute a deterministic family score in the range [0, 100].
 * Returns null when no data is available at all.
 */
export function computeFamilyScore(input: ScoringInput): number | null {
  const candidates: WeightedComponent[] = [];

  if (input.safetyScore != null) {
    candidates.push({ value: Math.max(0, Math.min(100, input.safetyScore)) / 100, weight: 0.35 });
  }
  if (input.aqiAvg != null) {
    candidates.push({ value: normaliseAqi(input.aqiAvg), weight: 0.25 });
  }
  if (input.costAvg != null) {
    candidates.push({ value: normaliseCost(input.costAvg), weight: 0.15 });
  }
  if (input.internetScore != null) {
    candidates.push({ value: Math.max(0, Math.min(100, input.internetScore)) / 100, weight: 0.15 });
  }
  if (input.qualityOfLife != null) {
    candidates.push({ value: Math.max(0, Math.min(100, input.qualityOfLife)) / 100, weight: 0.10 });
  }

  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = candidates.reduce((sum, c) => sum + c.value * c.weight, 0);

  // Round to one decimal place (e.g. 73.4)
  const PRECISION_MULTIPLIER = 1000;
  const PRECISION_DIVISOR = 10;
  return Math.round((weightedSum / totalWeight) * PRECISION_MULTIPLIER) / PRECISION_DIVISOR;
}
