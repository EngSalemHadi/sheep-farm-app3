// مشروع تربية الأغنام — Formatting Utilities

/**
 * Format a number as Arabic currency (SAR / ريال)
 */
export function formatCurrency(amount: number, decimals = 0): string {
  if (isNaN(amount) || !isFinite(amount)) return '٠ ر.س';
  const formatted = Math.abs(amount).toLocaleString('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ر.س`;
}

/**
 * Format a number with Arabic numerals
 */
export function formatNumber(n: number): string {
  if (isNaN(n) || !isFinite(n)) return '٠';
  return n.toLocaleString('ar-SA');
}

/**
 * Format a date string to Arabic locale
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value) || !isFinite(value)) return '٠٪';
  return `${Math.abs(value).toFixed(decimals)}٪`;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get color class based on positive/negative value
 */
export function profitColor(value: number): string {
  if (value > 0) return 'text-income';
  if (value < 0) return 'text-expense';
  return 'text-muted-foreground';
}

/**
 * Get sign prefix for a value
 */
export function signPrefix(value: number): string {
  if (value > 0) return '+';
  return '';
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
