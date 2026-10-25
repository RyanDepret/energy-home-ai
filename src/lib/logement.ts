import type { Chauffage, Logement, Periode, TypeLogement } from './types';

export const PERIODES: Periode[] = ['avant-1948', '1948-1974', '1975-1988', '1989-2005', 'apres-2005'];
export const TYPES: TypeLogement[] = ['maison', 'appartement'];
export const CHAUFFAGES: Chauffage[] = ['electricite', 'gaz', 'fioul', 'bois', 'pac', 'reseau'];

/** Départements de la région PACA couverts par le modèle. */
const PACA = ['04', '05', '06', '13', '83', '84'];
export function isPacaPostalCode(cp: string) {
  return /^\d{5}$/.test(cp) && PACA.includes(cp.slice(0, 2));
}

export function toSearchParams(l: Logement) {
  return new URLSearchParams({ surface: String(l.surface), periode: l.periode, type: l.type, chauffage: l.chauffage, cp: l.codePostal });
}

export function fromSearchParams(p: URLSearchParams): Logement | null {
  const surface = Number(p.get('surface'));
  const periode = p.get('periode') as Periode;
  const type = p.get('type') as TypeLogement;
  const chauffage = p.get('chauffage') as Chauffage;
  const codePostal = p.get('cp') ?? '';
  if (!surface || surface < 9 || surface > 1000) return null;
  if (!PERIODES.includes(periode) || !TYPES.includes(type) || !CHAUFFAGES.includes(chauffage)) return null;
  if (!isPacaPostalCode(codePostal)) return null;
  return { surface, periode, type, chauffage, codePostal };
}
