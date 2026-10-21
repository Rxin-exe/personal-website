export type Variant = "A" | "B";
export const VARIANTS: Variant[] = ["A", "B"];

export type VariantStats = { visitors: number; clicks: number; rate: number };
export type ExperimentStats = {
  A: VariantStats;
  B: VariantStats;
  total: number;
  leader: Variant | null;
  pValue: number | null;
  significant: boolean;
};

/** Standard normal CDF (Abramowitz & Stegun 7.1.26, error < 1.5e-7). */
function normalCdf(z: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const erf =
    1 -
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) *
      Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

/** Two-sided two-proportion z-test on click-through rate. */
export function computeStats(counts: Record<string, number>): ExperimentStats {
  const side = (v: Variant): VariantStats => {
    const visitors = counts[`${v}:exposure`] ?? 0;
    const clicks = Math.min(counts[`${v}:click`] ?? 0, visitors);
    return { visitors, clicks, rate: visitors ? clicks / visitors : 0 };
  };
  const A = side("A");
  const B = side("B");
  const total = A.visitors + B.visitors;

  let pValue: number | null = null;
  if (A.visitors > 0 && B.visitors > 0) {
    const pooled = (A.clicks + B.clicks) / total;
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / A.visitors + 1 / B.visitors));
    pValue = se > 0 ? 2 * (1 - normalCdf(Math.abs((B.rate - A.rate) / se))) : 1;
  }

  const leader = A.rate === B.rate ? null : A.rate > B.rate ? "A" : "B";
  return { A, B, total, leader, pValue, significant: pValue !== null && pValue < 0.05 };
}
