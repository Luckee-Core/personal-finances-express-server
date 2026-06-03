/**
 * Returns median absolute amount in cents for a list of transaction amounts.
 */
export const medianAmountCents = (amounts: number[]): number => {
  if (amounts.length === 0) return 0;
  const sorted = [...amounts].map((a) => Math.abs(a)).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};
