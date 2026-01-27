import { translations } from '@/lib/translations/es';

/**
 * Formats a number as currency based on the configured locale
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "S/ 1,000" for Peruvian Soles)
 */
export function formatCurrency(amount: number): string {
  const { symbol, locale } = translations.currency;
  const formatted = amount.toLocaleString(locale);
  return `${symbol} ${formatted}`;
}
