# EnergyHome AI — site web (direction « Nuit »)

Interface Next.js d'EnergyHome AI : simulateur de classe DPE, agent de rénovation et assistant RAG (embeddings Mistral, génération Claude Haiku), en français et en anglais.

## Démarrer (site + API en local)

Le site appelle l’API FastAPI du dépôt `energyhome-api` (branche `v2`), à placer à côté de ce dépôt (`../energyhome-api`).

1. **API** (premier terminal, PowerShell) :
   ```powershell
   cd ..\energyhome-api
   .venv\Scripts\activate
   uvicorn app.main:app --port 8000
   ```
   L’API lit ses clés dans `../energyhome-api/.env` : `ANTHROPIC_API_KEY` (génération, Claude Haiku) et `MISTRAL_API_KEY` (embeddings). Sans elles, `/predict` fonctionne mais `/agent` et `/chat` renvoient une erreur 500. L’origine `http://localhost:3000` est autorisée par défaut dans son CORS (`cors_origins`).
2. **Site** (second terminal) :
   ```bash
   npm install
   cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
   npm run dev                  # http://localhost:3000
   ```

**Mode démonstration** : uniquement quand l’API est injoignable (pas de `NEXT_PUBLIC_API_URL`, erreur réseau, délai dépassé). Les résultats sont alors des exemples, et un bandeau le signale toujours. Une erreur renvoyée par l’API (422, 500) est affichée comme une erreur, jamais remplacée par une démo.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

## Variables d'environnement

À définir dans Vercel (Settings → Environment Variables). Les variables `NEXT_PUBLIC_*` sont figées au build : après une modification, relancer un déploiement.

| Variable | Exemple | Production Vercel | Rôle |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.energyhome.ai` | Recommandée | URL de l'API FastAPI (sans elle : mode démonstration) |
| `NEXT_PUBLIC_SITE_URL` | `https://energyhome.ai` | **Obligatoire** | URL publique (SEO, sitemap, canoniques, image de partage). Le build échoue si elle est absente ou contient `localhost` quand `VERCEL_ENV=production` ; en local et sur les aperçus, repli sur `http://localhost:3000` |
| `CONTACT_WEBHOOK_URL` | `https://hook.eu2.make.com/…` | Facultative | Webhook qui reçoit le formulaire de contact (sinon : 503 et l'email s'affiche en repli) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `abc123…` | Facultative | Code de vérification Google Search Console (méthode « balise HTML », valeur de `content` seulement). Absente : aucune balise |

`VERCEL_ENV` est fourni automatiquement par Vercel (`production`, `preview` ou `development`) : ne pas le définir à la main.

En-têtes de sécurité ajoutés sur toutes les routes (`next.config.ts`) : `Content-Security-Policy: frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Contrat d'API (FastAPI)

Source de vérité : le code de l’API (`energyhome-api/app/schemas/` et `app/api/`, branche `v2`). Tous les appels sont des `POST` JSON ; côté site, tout passe par `src/lib/api.ts`.

**`/predict`** — entrée (fournir `periode` **ou** `annee_construction`, pas les deux) :
```json
{ "surface": 85, "periode": "1948_1974", "type_batiment": "maison", "chauffage": "fioul", "code_postal": "83600" }
```
- `surface` : 9 à 1000 ; `annee_construction` : 1800 à l’année en cours ; `code_postal` : 5 chiffres, départements 04, 05, 06, 13, 83, 84.
- `periode` : `avant_1948`, `1948_1974`, `1975_1977`, `1978_1982`, `1983_1988`, `1989_2000`, `2001_2005`, `2006_2012`, `2013_2021`, `apres_2021`.
- `type_batiment` : `maison`, `appartement`.
- `chauffage` : `electricite`, `electricite_renouvelable`, `gaz_naturel`, `fioul`, `gpl`, `propane`, `bois_buches`, `bois_granules`, `bois_plaquettes`, `reseau_chaleur` (pompe à chaleur = `electricite`).

Sortie (valeurs d’exemple, pas un résultat réel) :
```json
{ "classe": "D", "probabilites": { "A": 0.0, "B": 0.01, "C": 0.2, "D": 0.45, "E": 0.25, "F": 0.07, "G": 0.02 },
  "importances": [{ "critere": "Période de construction", "valeur": "1948_1974", "poids": 0.41 }],
  "model_version": "v3-lightgbm-2026-11", "entree": { "…": "…" } }
```
Les probabilités calibrées peuvent valoir exactement 0 : le site affiche « < 1 % » sans modifier la valeur. `critere` est un libellé français (`Surface`, `Période de construction`, `Type de bâtiment`, `Énergie de chauffage`, `Département`, `Zone climatique`), traduit via `src/lib/criteres.ts` ; un libellé inconnu s’affiche tel quel. Les poids font 1 au total. Erreur de validation : 422, `{ "detail": [{ "msg": "Value error, …" }] }`, dont le message est affiché.

**`/agent`** — entrée :
```json
{ "classe_dpe": "D", "surface": 85, "annee_construction": 1948, "type_batiment": "maison",
  "type_chauffage": "Fioul", "code_postal": "83600", "locale": "fr" }
```
`annee_construction` est obligatoire : le site envoie l’année exacte si elle est connue, sinon la première année de la période (`anneeDebutPeriode`, `src/lib/logement.ts`). `type_chauffage` est un texte libre (le site envoie le libellé lisible). Sortie :
```json
{ "classe_dpe": "D", "recommandations": {
  "situation": { "titre": "…", "icone": "…", "resume": "…", "detail": "…" },
  "travaux":   { "titre": "…", "icone": "…", "resume": "…", "items": ["…", "…"] },
  "aides":     { "titre": "…", "icone": "…", "resume": "…", "items": ["…", "…"] } } }
```
Textes générés, affichés tels quels (le site n’ajoute ni prix ni budget). Si la génération échoue, l’API renvoie `items: []` : le site affiche un message d’erreur.

**`/chat`** — entrée : `{ "question": "…", "locale": "fr" }` (ni modèle ni logement). Sortie : `{ "question": "…", "reponse": "…", "sources": [{ "extrait": "150 premiers caractères…", "score": 0.82 }] }`.

Pas de route `/feedback` ni `/vote` : le bloc de retour est masqué et « Comparer » est affiché désactivé (« bientôt »).

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
src/lib/             api.ts (client API), dpe.ts (seuils 2026), demo.ts, logement.ts, criteres.ts, site.ts
src/fonts/           polices auto-hébergées (aucun appel à Google Fonts)
```
