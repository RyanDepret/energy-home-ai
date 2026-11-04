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

/**
 * Réponse de `POST /agent` : textes générés, items en texte libre. `travaux.titre` est choisi par l'API selon la
 * classe (vide si absent : le site affiche alors son titre par défaut). `sources` : URL officielles des documents
 * transmis au modèle (vide si absentes).
 */
export interface Recommandations {
  situation: { resume: string; detail: string };
  travaux: { titre: string; resume: string; items: string[] };
  aides: { resume: string; items: string[] };
  sources: string[];
}

/** Source renvoyée par `POST /chat` : un extrait du document et son score de similarité. */
export interface Source { extrait: string; score: number }
/** Modèle de génération de `POST /chat` : la recherche documentaire (et donc les sources) est la même pour les deux. */
export type ModeleChat = 'claude' | 'mistral';
export interface ReponseChat {
  texte: string;
  sources: Source[];
  modele: ModeleChat;
  /** Temps de génération seul, mesuré par l'API (absent en mode démonstration). */
  dureeMs?: number;
  /** Présent seulement si le fournisseur renvoie l'usage. */
  tokens?: { entree: number; sortie: number };
}

/** Résultat d'un appel : `demo` vaut true quand l'API est injoignable et que des données d'exemple sont affichées. */
export interface ApiResult<T> { data: T; demo: boolean }
