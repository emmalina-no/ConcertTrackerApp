// Averaging helper for per-performance artist ratings.
// Nullish ratings mean "not rated" and are excluded, so they never drag the average down.

export function averageRating(ratings: (number | null | undefined)[]): {
  average: number | null;
  count: number;
} {
  const values = ratings.filter((r): r is number => r != null);
  if (values.length === 0) return { average: null, count: 0 };
  const sum = values.reduce((total, r) => total + r, 0);
  return { average: sum / values.length, count: values.length };
}
