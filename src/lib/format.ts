/** Montant en k€ : 20500 → « 20,5 k€ » (fr) ou « €20.5k » (en). */
export function kEuros(value: number, locale: string) {
  const k = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / 1000);
  return locale === 'fr' ? `${k} k€` : `€${k}k`;
}
export function kEurosRange(min: number, max: number, locale: string) {
  return `${kEuros(min, locale)} – ${kEuros(max, locale)}`;
}
export function euros(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}
export function percent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value);
}
