import type { DpeClass } from './dpe';

/** Codes de l'API v2 (`app/schemas/predict.py` de energyhome-api) : ne pas les renommer. */
export type Periode =
  | 'avant_1948' | '1948_1974' | '1975_1977' | '1978_1982' | '1983_1988'
  | '1989_2000' | '2001_2005' | '2006_2012' | '2013_2021' | 'apres_2021';
export type TypeLogement = 'maison' | 'appartement';
export type Chauffage =
  | 'electricite' | 'electricite_renouvelable' | 'gaz_naturel' | 'fioul' | 'gpl'
  | 'propane' | 'bois_buches' | 'bois_granules' | 'bois_plaquettes' | 'reseau_chaleur';

export interface Logement {
  surface: number;
  /** Période ADEME ; si `annee` est renseignée, c'est la période de cette année. */
  periode: Periode;
  /** Année exacte de construction, facultative. */
  annee?: number;
  type: TypeLogement;
  chauffage: Chauffage;
  codePostal: string;
}

export interface Importance { critere: string; valeur: unknown; poids: number }

export interface Prediction {
  classe: DpeClass;
  probabilites: Record<DpeClass, number>;
  importances: Importance[];
  modelVersion?: string;
}

/** Réponse de `POST /agent` : textes générés, items en texte libre. */
export interface Recommandations {
  situation: { resume: string; detail: string };
  travaux: { resume: string; items: string[] };
  aides: { resume: string; items: string[] };
}

/** Source renvoyée par `POST /chat` : un extrait du document et son score de similarité. */
export interface Source { extrait: string; score: number }
export interface ReponseChat { texte: string; sources: Source[] }

/** Résultat d'un appel : `demo` vaut true quand l'API est injoignable et que des données d'exemple sont affichées. */
export interface ApiResult<T> { data: T; demo: boolean }
