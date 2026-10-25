import type { ApiResult, Logement, Modele, PlanRenovation, Prediction, ReponseChat } from './types';
import type { DpeClass } from './dpe';
import { demoChat, demoPlan, demoPrediction } from './demo';

/**
 * Client de l'API FastAPI d'EnergyHome AI.
 * Contrat attendu : voir README.md, section « Contrat d'API ». Adapte les chemins et les champs
 * ici, à un seul endroit, si ton API diffère.
 */
const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = 20000;

async function call<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (!API) throw new Error('NEXT_PUBLIC_API_URL non défini');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`API ${path} : ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function toApiLogement(l: Logement) {
  return { surface: l.surface, periode: l.periode, type: l.type, chauffage: l.chauffage, code_postal: l.codePostal };
}

export async function predict(l: Logement, signal?: AbortSignal): Promise<ApiResult<Prediction>> {
  try {
    const r = await call<{
      classe: DpeClass;
      probabilites: Record<DpeClass, number>;
      importances: { critere: string; valeur: string; poids: number }[];
      model_version?: string;
    }>('/predict', toApiLogement(l), signal);
    return { data: { classe: r.classe, probabilites: r.probabilites, importances: r.importances, modelVersion: r.model_version }, demo: false };
  } catch (e) {
    if (signal?.aborted) throw e;
    return { data: demoPrediction(l), demo: true };
  }
}

export async function renovationPlan(l: Logement, classe: DpeClass, signal?: AbortSignal): Promise<ApiResult<PlanRenovation>> {
  try {
    const r = await call<{
      situation: string; details: string; objectif: DpeClass;
      travaux: { titre: string; description: string; cout_min: number; cout_max: number; impact: 'fort' | 'moyen' | 'confort' }[];
      aides: { nom: string; statut: string; description: string }[];
    }>('/agent/plan', { ...toApiLogement(l), classe }, signal);
    return {
      data: {
        situation: r.situation, details: r.details, objectif: r.objectif, aides: r.aides,
        travaux: r.travaux.map((t) => ({ titre: t.titre, description: t.description, coutMin: t.cout_min, coutMax: t.cout_max, impact: t.impact })),
      },
      demo: false,
    };
  } catch (e) {
    if (signal?.aborted) throw e;
    return { data: demoPlan(classe), demo: true };
  }
}

export async function chat(question: string, modele: Modele, logement?: Logement, signal?: AbortSignal): Promise<ApiResult<ReponseChat>> {
  try {
    const r = await call<{ reponse: string; sources: { titre: string; url?: string }[]; duree_ms?: number; tokens?: number }>(
      '/chat', { question, modele, logement: logement ? toApiLogement(logement) : null }, signal,
    );
    return { data: { texte: r.reponse, sources: r.sources ?? [], dureeMs: r.duree_ms, tokens: r.tokens }, demo: false };
  } catch (e) {
    if (signal?.aborted) throw e;
    return { data: demoChat(question, modele), demo: true };
  }
}

/** Retours et votes : envoyés au mieux, sans bloquer l'interface. */
export async function sendFeedback(payload: { juste: boolean; classePredite: DpeClass; classeOfficielle?: DpeClass }) {
  try { await call('/feedback', { juste: payload.juste, classe_predite: payload.classePredite, classe_officielle: payload.classeOfficielle ?? null }); } catch { /* sans effet pour l'utilisateur */ }
}
export async function sendVote(question: string, gagnant: Modele) {
  try { await call('/vote', { question, gagnant }); } catch { /* sans effet pour l'utilisateur */ }
}
