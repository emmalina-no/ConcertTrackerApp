/** Parse an ISO `yyyy-mm-dd` string into a local `Date` (falls back to today). */
export function parseISO(value: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a `Date` as an ISO `yyyy-mm-dd` string. */
export function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format an ISO `yyyy-mm-dd` string for display as `dd/mm/yyyy`. */
export function isoToDisplay(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

/** Format a start/end ISO pair, collapsing to a single date when they match. */
export function formatDateRange(startDate: string, endDate: string): string {
  if (!endDate || startDate === endDate) return isoToDisplay(startDate);
  return `${isoToDisplay(startDate)} – ${isoToDisplay(endDate)}`;
}
