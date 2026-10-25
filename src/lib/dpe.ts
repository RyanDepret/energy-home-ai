/**
 * Référentiel DPE (méthode 2021, coefficient électricité 1,9 depuis le 1er janvier 2026).
 * Source : https://www.economie.gouv.fr/actualites/un-nouveau-dpe-au-1er-janvier-2026-pour-favoriser-le-chauffage-electrique
 */
export const CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type DpeClass = (typeof CLASSES)[number];

/** Seuils d'énergie primaire en kWh/m²·an (bornes hautes, G au-delà de 420). */
export const RANGES: Record<DpeClass, string> = {
  A: '≤ 70', B: '71 – 110', C: '111 – 180', D: '181 – 250', E: '251 – 330', F: '331 – 420', G: '> 420',
};

export function isDpeClass(value: unknown): value is DpeClass {
  return typeof value === 'string' && (CLASSES as readonly string[]).includes(value);
}

/** Classe la plus probable (repli si l'API ne renvoie pas de classe explicite). */
export function topClass(probas: Partial<Record<DpeClass, number>>): DpeClass {
  return CLASSES.reduce((best, c) => ((probas[c] ?? 0) > (probas[best] ?? 0) ? c : best), 'D' as DpeClass);
}

/** Deuxième classe la plus probable : le modèle hésite souvent entre deux voisines. */
export function runnerUp(probas: Partial<Record<DpeClass, number>>, top: DpeClass): DpeClass {
  return CLASSES.filter((c) => c !== top).reduce((best, c) => ((probas[c] ?? 0) > (probas[best] ?? 0) ? c : best));
}

/** Clé de traduction de ce que la classe implique pour la location (loi Climat et Résilience). */
export function rentalKey(c: DpeClass): 'free' | 'e2034' | 'f2028' | 'g2025' {
  if (c === 'G') return 'g2025';
  if (c === 'F') return 'f2028';
  if (c === 'E') return 'e2034';
  return 'free';
}
