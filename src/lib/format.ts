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
/**
 * Probabilité ou poids affiché : jamais « 0 % » (la calibration isotonique peut renvoyer 0 exact).
 * Sous 1 %, affiche `lessThanOne` (texte des messages, « < 1 % »). La valeur n'est pas modifiée.
 */
export function pct(value: number, locale: string, lessThanOne: string) {
  return value < 0.01 ? lessThanOne : percent(value, locale);
}
