/** Statistics for Objective 4. Pure and dependency-free. */

const Z95 = 1.959963984540054;

/** Complementary error function (Numerical Recipes erfcc; |error| < 1.2e-7). */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
    );
  return x >= 0 ? r : 2 - r;
}

/** Two-sided p-value of a standard normal statistic. */
export const normalTwoSided = (z: number) => erfc(Math.abs(z) / Math.SQRT2);

export interface Interval {
  lower: number;
  upper: number;
}

/** Wilson score interval for a proportion (95% by default); null when n = 0. */
export function wilsonInterval(successes: number, n: number, z = Z95): Interval | null {
  if (n <= 0) return null;
  const p = successes / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denominator;
  return { lower: Math.max(0, center - half), upper: Math.min(1, center + half) };
}

function binomial(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

export interface McNemarResult {
  /** Discordant pairs: A right and B wrong (b), A wrong and B right (c). */
  b: number;
  c: number;
  method: "exact" | "chi_square" | "none";
  statistic: number | null;
  p: number | null;
}

/**
 * McNemar's test on paired decisions. Uses the exact binomial test when
 * b + c < 25, otherwise χ² with continuity correction, (|b − c| − 1)² / (b + c).
 */
export function mcnemar(b: number, c: number): McNemarResult {
  const n = b + c;
  if (n === 0) return { b, c, method: "none", statistic: null, p: null };
  if (n < 25) {
    let tail = 0;
    for (let k = 0; k <= Math.min(b, c); k++) tail += binomial(n, k);
    return { b, c, method: "exact", statistic: Math.min(b, c), p: Math.min(1, 2 * tail * 0.5 ** n) };
  }
  const statistic = (Math.abs(b - c) - 1) ** 2 / n;
  return { b, c, method: "chi_square", statistic, p: erfc(Math.sqrt(statistic / 2)) };
}

export interface WilcoxonResult {
  /** Pairs with a non-zero difference (zeros are dropped, Wilcoxon's method). */
  n: number;
  w_plus: number;
  w_minus: number;
  method: "exact" | "normal" | "none";
  z: number | null;
  p: number | null;
}

/**
 * Wilcoxon signed-rank test on paired samples (e.g. baseline vs enriched
 * absolute errors). Exact distribution for n ≤ 20 without ties, otherwise a
 * normal approximation with tie and continuity correction. Two-sided.
 */
export function wilcoxonSignedRank(x: readonly number[], y: readonly number[]): WilcoxonResult {
  if (x.length !== y.length) throw new Error("Wilcoxon needs paired samples of equal length");
  const diffs = x.map((value, i) => value - y[i]).filter((d) => d !== 0);
  const n = diffs.length;
  if (n === 0) return { n, w_plus: 0, w_minus: 0, method: "none", z: null, p: null };

  const order = diffs.map((d, i) => ({ abs: Math.abs(d), sign: Math.sign(d), i })).sort((a, b) => a.abs - b.abs);
  const ranks = new Array<number>(n);
  const tieSizes: number[] = [];
  for (let start = 0; start < n; ) {
    let end = start;
    while (end + 1 < n && order[end + 1].abs === order[start].abs) end++;
    const rank = (start + end + 2) / 2;
    for (let k = start; k <= end; k++) ranks[k] = rank;
    tieSizes.push(end - start + 1);
    start = end + 1;
  }
  let wPlus = 0;
  let wMinus = 0;
  order.forEach((item, k) => (item.sign > 0 ? (wPlus += ranks[k]) : (wMinus += ranks[k])));
  const hasTies = tieSizes.some((t) => t > 1);

  if (n <= 20 && !hasTies) {
    // Number of subsets of ranks {1..n} reaching each sum.
    const max = (n * (n + 1)) / 2;
    const counts = new Array<number>(max + 1).fill(0);
    counts[0] = 1;
    for (let r = 1; r <= n; r++) for (let s = max; s >= r; s--) counts[s] += counts[s - r];
    const w = Math.min(wPlus, wMinus);
    const tail = counts.slice(0, Math.floor(w) + 1).reduce((sum, count) => sum + count, 0);
    return { n, w_plus: wPlus, w_minus: wMinus, method: "exact", z: null, p: Math.min(1, (2 * tail) / 2 ** n) };
  }

  const mean = (n * (n + 1)) / 4;
  const variance = (n * (n + 1) * (2 * n + 1)) / 24 - tieSizes.reduce((sum, t) => sum + (t ** 3 - t), 0) / 48;
  const deviation = wPlus - mean;
  const z = variance > 0 ? (Math.sign(deviation) * Math.max(0, Math.abs(deviation) - 0.5)) / Math.sqrt(variance) : 0;
  return { n, w_plus: wPlus, w_minus: wMinus, method: "normal", z, p: normalTwoSided(z) };
}

/** Nearest-rank quantile of an ascending list. */
export function quantile(sorted: readonly number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}
