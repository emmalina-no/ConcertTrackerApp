/** True when every value is a non-empty string once trimmed. */
export function filled(...values: string[]): boolean {
  return values.every((value) => value.trim().length > 0);
}
