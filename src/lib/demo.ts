import type { Logement, PlanRenovation, Prediction, ReponseChat, Modele } from './types';
import { CLASSES, type DpeClass } from './dpe';

/**
 * Données de démonstration, affichées UNIQUEMENT quand l'API est injoignable.
 * L'interface le signale toujours à l'utilisateur : ce ne sont pas des résultats réels.
 */
export function demoPrediction(l: Logement): Prediction {
  const base: Record<string, number> = { 'avant-1948': 5, '1948-1974': 5, '1975-1988': 4, '1989-2005': 3, 'apres-2005': 2 };
  let idx = base[l.periode] ?? 4;
  if (l.chauffage === 'pac' || l.chauffage === 'bois') idx -= 1;
  if (l.chauffage === 'fioul') idx += 1;
  if (l.surface < 40) idx += 1;
  idx = Math.max(0, Math.min(6, idx));
  const w = [46, 24, 9, 3, 1.5, 1, 0.5];
  const raw = CLASSES.map((_, i) => w[Math.abs(i - idx)]);
  const tot = raw.reduce((a, b) => a + b, 0);
  const probabilites = Object.fromEntries(CLASSES.map((c, i) => [c, raw[i] / tot])) as Record<DpeClass, number>;
  return {
    classe: CLASSES[idx],
    probabilites,
    importances: [
      { critere: 'periode', valeur: l.periode, poids: 0.88 },
      { critere: 'chauffage', valeur: l.chauffage, poids: 0.76 },
      { critere: 'surface', valeur: `${l.surface} m²`, poids: 0.44 },
      { critere: 'localisation', valeur: l.codePostal, poids: 0.18 },
    ],
    modelVersion: 'demo',
  };
}

export function demoPlan(classe: DpeClass): PlanRenovation {
  const objectif = CLASSES[Math.max(0, CLASSES.indexOf(classe) - 2)];
  return {
    situation: `Logement estimé en classe ${classe}.`,
    details: "Gagner deux classes ouvre droit à MaPrimeRénov' rénovation d'ampleur, sous conditions.",
    objectif,
    travaux: [
      { titre: 'Combles et toiture', description: 'Souvent le premier poste de déperdition', coutMin: 1500, coutMax: 3000, impact: 'fort' },
      { titre: 'Pompe à chaleur', description: 'Remplace les radiateurs électriques anciens', coutMin: 8000, coutMax: 12000, impact: 'fort' },
      { titre: 'Panneaux photovoltaïques', description: 'Bon ensoleillement dans le Var', coutMin: 6000, coutMax: 10000, impact: 'moyen' },
      { titre: 'Fenêtres double vitrage', description: 'Améliore surtout le confort', coutMin: 5000, coutMax: 8000, impact: 'confort' },
    ],
    aides: [
      { nom: "MaPrimeRénov' d'ampleur", statut: 'Sous conditions', description: "Gain de 2 classes minimum, Mon Accompagnateur Rénov' obligatoire, taux selon revenus" },
      { nom: "MaPrimeRénov' par geste", statut: 'Selon revenus', description: 'Ménages modestes et très modestes' },
      { nom: 'Primes CEE', statut: 'Possible', description: "Non cumulables avec la rénovation d'ampleur" },
      { nom: 'Éco-PTZ', statut: 'Éligible', description: "Jusqu'à 50 000 € sans intérêts, sans condition de revenus" },
      { nom: 'TVA à 5,5 %', statut: 'Applicable', description: "Logement de plus de 2 ans, appliquée par l'artisan" },
    ],
  };
}

export function demoChat(question: string, modele: Modele): ReponseChat {
  return {
    texte:
      modele === 'claude'
        ? `Réponse de démonstration (API indisponible) à : « ${question} ». Ici s'affichera la réponse de Claude, avec ses citations [1] renvoyant aux passages récupérés [2].`
        : `Réponse de démonstration (API indisponible) à : « ${question} ». Mêmes passages récupérés, seul le modèle qui rédige change.`,
    sources: [{ titre: '[Document source 1]' }, { titre: '[Document source 2]' }],
  };
}
