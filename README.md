# EnergyHome AI — site web (direction « Nuit »)

Interface Next.js d'EnergyHome AI : simulateur de classe DPE, agent de rénovation et assistant RAG (Claude + Mistral), en français et en anglais.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigne les valeurs
npm run dev                  # http://localhost:3000
```

Sans `NEXT_PUBLIC_API_URL`, le site fonctionne en **mode démonstration** : les résultats sont des exemples, et un bandeau le signale toujours.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

## Variables d'environnement

| Variable | Exemple | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.energyhome.ai` | URL de l'API FastAPI (figée au build) |
| `NEXT_PUBLIC_SITE_URL` | `https://energyhome.ai` | URL publique (SEO, sitemap, image de partage) |
| `CONTACT_WEBHOOK_URL` | `https://hook.eu2.make.com/…` | Webhook qui reçoit le formulaire de contact (sinon : 503 et l'email s'affiche en repli) |

## Contrat d'API (FastAPI)

Tous les appels sont des `POST` JSON. Les adapter se fait à un seul endroit : `src/lib/api.ts`.

**`/predict`** — entrée :
```json
{ "surface": 85, "periode": "1948-1974", "type": "maison", "chauffage": "fioul", "code_postal": "83600" }
```
sortie :
```json
{ "classe": "E", "probabilites": { "A": 0.01, "B": 0.02, "C": 0.05, "D": 0.2, "E": 0.5, "F": 0.18, "G": 0.04 },
  "importances": [{ "critere": "periode", "valeur": "1948-1974", "poids": 0.88 }], "model_version": "v2-dpe2026" }
```
`critere` ∈ `periode`, `chauffage`, `surface`, `localisation`, `type` ; `poids` entre 0 et 1.

**`/agent/plan`** — entrée : le logement + `"classe"`. Sortie :
```json
{ "situation": "…", "details": "…", "objectif": "C",
  "travaux": [{ "titre": "…", "description": "…", "cout_min": 1500, "cout_max": 3000, "impact": "fort" }],
  "aides": [{ "nom": "MaPrimeRénov'", "statut": "Sous conditions", "description": "…" }] }
```
`impact` ∈ `fort`, `moyen`, `confort`.

**`/chat`** — entrée : `{ "question": "…", "modele": "claude" | "mistral", "logement": {…} | null }`. Sortie :
`{ "reponse": "Texte avec citations [1] [2]", "sources": [{ "titre": "…", "url": "…" }], "duree_ms": 2100, "tokens": 640 }`

**`/feedback`** : `{ "juste": false, "classe_predite": "E", "classe_officielle": "D" }` · **`/vote`** : `{ "question": "…", "gagnant": "claude" }`

Pense à autoriser l'origine du site dans le CORS de FastAPI.

## Docker

```bash
docker build -t energy-home-ai --build-arg NEXT_PUBLIC_API_URL=https://api.exemple.fr --build-arg NEXT_PUBLIC_SITE_URL=https://exemple.fr .
docker run -p 3000:3000 -e CONTACT_WEBHOOK_URL=https://… energy-home-ai
```

## Avant la mise en ligne

- `src/lib/site.ts` : liens LinkedIn, GitHub et dépôt (`A-COMPLETER`).
- Mentions légales : statut et SIRET (surlignés « À compléter » sur la page).
- `CONTACT_WEBHOOK_URL` configuré et testé.

## Structure

```
messages/            textes FR et EN (mêmes clés dans les deux fichiers)
public/images/       photos (crédits sur /credits)
src/app/[locale]/    pages : accueil, simulateur, assistant, a-propos, contact, credits, mentions-legales, confidentialite
src/app/api/contact  réception du formulaire
src/components/      Header, Footer, HeroSlider, Reveal, result/*, assistant/Chat…
src/lib/             api.ts (client API), dpe.ts (seuils 2026), demo.ts, logement.ts, site.ts
src/fonts/           polices auto-hébergées (aucun appel à Google Fonts)
```
