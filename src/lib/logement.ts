import type { Chauffage, Logement, Periode, TypeLogement } from './types';

export const PERIODES: Periode[] = [
  'avant_1948', '1948_1974', '1975_1977', '1978_1982', '1983_1988',
  '1989_2000', '2001_2005', '2006_2012', '2013_2021', 'apres_2021',
];
export const TYPES: TypeLogement[] = ['maison', 'appartement'];
export const CHAUFFAGES: Chauffage[] = [
  'electricite', 'electricite_renouvelable', 'gaz_naturel', 'fioul', 'gpl',
  'propane', 'bois_buches', 'bois_granules', 'bois_plaquettes', 'reseau_chaleur',
];

/** Dernière année de chaque période : mêmes bornes que `annee_vers_periode` (energyhome-api, app/ml/features.py). */
const BORNES: [number, Periode][] = [
  [1947, 'avant_1948'], [1974, '1948_1974'], [1977, '1975_1977'], [1982, '1978_1982'], [1988, '1983_1988'],
  [2000, '1989_2000'], [2005, '2001_2005'], [2012, '2006_2012'], [2021, '2013_2021'],
];
export function periodeDeAnnee(annee: number): Periode {
  return BORNES.find(([fin]) => annee <= fin)?.[1] ?? 'apres_2021';
}

/**
 * Année transmise à l'agent (`POST /agent` exige un entier) quand l'année exacte n'est pas connue :
 * première année de la période (avant 1948 → 1947, après 2021 → 2022). C'est une approximation.
 */
const DEBUTS: Record<Periode, number> = {
  avant_1948: 1947, '1948_1974': 1948, '1975_1977': 1975, '1978_1982': 1978, '1983_1988': 1983,
  '1989_2000': 1989, '2001_2005': 2001, '2006_2012': 2006, '2013_2021': 2013, apres_2021: 2022,
};
export function anneeDebutPeriode(p: Periode) {
  return DEBUTS[p];
}

/** Année de construction acceptée par l'API : 1800 à l'année en cours. */
export function isAnneeValide(a: number) {
  return Number.isInteger(a) && a >= 1800 && a <= new Date().getFullYear();
}

/** Départements de la région PACA couverts par le modèle (`departements_autorises` de l'API). */
const PACA = ['04', '05', '06', '13', '83', '84'];
export function isPacaPostalCode(cp: string) {
  return /^\d{5}$/.test(cp) && PACA.includes(cp.slice(0, 2));
}

export function toSearchParams(l: Logement) {
  const p = new URLSearchParams({ surface: String(l.surface), periode: l.periode, type: l.type, chauffage: l.chauffage, cp: l.codePostal });
  if (l.annee != null) p.set('annee', String(l.annee));
  return p;
}

export function fromSearchParams(p: URLSearchParams): Logement | null {
  const surface = Number(p.get('surface'));
  let periode = p.get('periode') as Periode;
  const type = p.get('type') as TypeLogement;
  const chauffage = p.get('chauffage') as Chauffage;
  const codePostal = p.get('cp') ?? '';
  const anneeTxt = p.get('annee');
  let annee: number | undefined;
  if (anneeTxt) {
    annee = Number(anneeTxt);
    if (!isAnneeValide(annee)) return null;
    periode = periodeDeAnnee(annee);
  }
  if (!surface || surface < 9 || surface > 1000) return null;
  if (!PERIODES.includes(periode) || !TYPES.includes(type) || !CHAUFFAGES.includes(chauffage)) return null;
  if (!isPacaPostalCode(codePostal)) return null;
  return { surface, periode, annee, type, chauffage, codePostal };
}
