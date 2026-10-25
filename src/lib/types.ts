import type { DpeClass } from './dpe';

export type Periode = 'avant-1948' | '1948-1974' | '1975-1988' | '1989-2005' | 'apres-2005';
export type TypeLogement = 'maison' | 'appartement';
export type Chauffage = 'electricite' | 'gaz' | 'fioul' | 'bois' | 'pac' | 'reseau';

export interface Logement {
  surface: number;
  periode: Periode;
  type: TypeLogement;
  chauffage: Chauffage;
  codePostal: string;
}

export interface Prediction {
  classe: DpeClass;
  probabilites: Record<DpeClass, number>;
  importances: { critere: string; valeur: string; poids: number }[];
  modelVersion?: string;
}

export interface Travail { titre: string; description: string; coutMin: number; coutMax: number; impact: 'fort' | 'moyen' | 'confort' }
export interface Aide { nom: string; statut: string; description: string }
export interface PlanRenovation {
  situation: string;
  details: string;
  objectif: DpeClass;
  travaux: Travail[];
  aides: Aide[];
}

export type Modele = 'claude' | 'mistral';
export interface Source { titre: string; url?: string }
export interface ReponseChat { texte: string; sources: Source[]; dureeMs?: number; tokens?: number }

/** Résultat d'un appel : `demo` vaut true quand l'API est injoignable et que des données d'exemple sont affichées. */
export interface ApiResult<T> { data: T; demo: boolean }
