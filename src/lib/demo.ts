import type { Logement, ModeleChat, Prediction, Recommandations, ReponseChat } from './types';
import { CLASSES, type DpeClass } from './dpe';
import { PERIODES } from './logement';

/**
 * Données de démonstration, affichées UNIQUEMENT quand l'API est injoignable.
 * L'interface le signale toujours à l'utilisateur : ce ne sont pas des résultats réels.
 */
export function demoPrediction(l: Logement): Prediction {
  const rang = PERIODES.indexOf(l.periode); // 0 (avant 1948) … 9 (après 2021)
  let idx = rang <= 1 ? 5 : rang <= 4 ? 4 : rang <= 6 ? 3 : 2;
  if (l.chauffage.startsWith('bois')) idx -= 1;
  if (l.chauffage === 'fioul') idx += 1;
  if (l.surface < 40) idx += 1;
  idx = Math.max(0, Math.min(6, idx));
  const w = [46, 24, 9, 3, 1.5, 1, 0.5];
  const raw = CLASSES.map((_, i) => w[Math.abs(i - idx)]);
  const tot = raw.reduce((a, b) => a + b, 0);
  const probabilites = Object.fromEntries(CLASSES.map((c, i) => [c, raw[i] / tot])) as Record<DpeClass, number>;
  // Mêmes libellés de critères que l'API ; poids d'exemple, somme = 1
  return {
    classe: CLASSES[idx],
    probabilites,
    importances: [
      { critere: 'Période de construction', valeur: l.periode, poids: 0.4 },
      { critere: 'Énergie de chauffage', valeur: l.chauffage, poids: 0.3 },
      { critere: 'Surface', valeur: l.surface, poids: 0.15 },
      { critere: 'Type de bâtiment', valeur: l.type, poids: 0.1 },
      { critere: 'Département', valeur: l.codePostal.slice(0, 2), poids: 0.05 },
    ],
    modelVersion: 'demo',
  };
}

export function demoRecommandations(classe: DpeClass): Recommandations {
  return {
    situation: {
      resume: `Exemple de démonstration pour un logement estimé en classe ${classe}.`,
      detail: 'Ici s’affichera l’analyse de l’agent : implications réglementaires et financières pour ce logement.',
    },
    travaux: {
      resume: 'Exemple : les travaux prioritaires proposés par l’agent.',
      items: ['[Travaux proposés par l’agent 1]', '[Travaux proposés par l’agent 2]'],
    },
    aides: {
      resume: 'Exemple : les aides mentionnées par l’agent.',
      items: ['[Aide mentionnée par l’agent 1]', '[Aide mentionnée par l’agent 2]'],
    },
  };
}

export function demoChat(question: string, modele: ModeleChat): ReponseChat {
  return {
    modele,
    texte: `Réponse de démonstration (API indisponible) à : « ${question} ». Ici s’affichera la réponse rédigée à partir des passages récupérés.`,
    sources: [{ extrait: '[Extrait de document 1]', score: 0 }, { extrait: '[Extrait de document 2]', score: 0 }],
  };
}
