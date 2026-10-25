import { NextResponse } from 'next/server';

/**
 * Réception du formulaire de contact.
 * Le message est transmis à CONTACT_WEBHOOK_URL (ex. : un webhook Make, Zapier, n8n ou Slack
 * qui t'envoie un email). Sans webhook configuré, la route renvoie 503 et le formulaire
 * affiche l'adresse email en repli : aucun message n'est perdu en silence.
 */
const TOPICS = new Set(['logement', 'pro', 'recrutement']);
const hits = new Map<string, { n: number; at: number }>();

function limited(ip: string) {
  // Limite simple en mémoire : 5 messages par 10 minutes et par IP (suffisant pour un site vitrine).
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 600_000) { hits.set(ip, { n: 1, at: now }); return false; }
  h.n += 1;
  return h.n > 5;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const str = (k: string, max: number) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const data = { topic: str('topic', 20), name: str('name', 120), email: str('email', 200), company: str('company', 160), message: str('message', 5000) };

  // Champ piège rempli : robot. On répond « ok » sans rien transmettre.
  if (str('website', 200)) return NextResponse.json({ ok: true });
  if (!TOPICS.has(data.topic) || !data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.message.length < 10 || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, receivedAt: new Date().toISOString(), source: 'energy-home-ai' }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
