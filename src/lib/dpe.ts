/**
 * Référentiel DPE (méthode 2021, coefficient électricité 1,9 depuis le 1er janvier 2026).
 * Source : https://www.economie.gouv.fr/actualites/un-nouveau-dpe-au-1er-janvier-2026-pour-favoriser-le-chauffage-electrique
 */
export const CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type DpeClass = (typeof CLASSES)[number];

/**
 * Libellés d'affichage des seuils d'énergie primaire, en kWh/m²·an (logements de plus de 40 m²).
 * Arrêté du 31 mars 2021 : consommation arrondie à l'entier inférieur, inégalités strictes (A < 70, B < 110…).
 * Les logements de 40 m² ou moins ont des seuils adaptés à la surface (arrêté du 25 mars 2024, NOR TREL2330369A),
 * non implémentés : la page résultat le signale.
 */
export const RANGES: Record<DpeClass, string> = {
  A: '< 70', B: '70 – 109', C: '110 – 179', D: '180 – 249', E: '250 – 329', F: '330 – 419', G: '≥ 420',
};

/** Surface (m²) jusqu'à laquelle les seuils officiels sont adaptés (arrêté du 25 mars 2024). */
export const SMALL_SURFACE_MAX = 40;

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
