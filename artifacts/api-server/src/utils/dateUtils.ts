export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isExpired(date: Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}
