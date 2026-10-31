# CLAUDE.md — EnergyHome AI (site web)

Site vitrine et produit d'EnergyHome AI, conçu par Ryan (ingénieur IA en formation, Var). Next.js 15 (App Router), React 19, TypeScript, next-intl (fr par défaut, en), Lenis. L'API Python (FastAPI) est dans un autre dépôt : le contrat est dans README.md.

## Commandes
- `npm run dev` · `npm run typecheck` · `npm run lint` · `npm run build`
- Avant de dire qu'une tâche est finie : typecheck + lint + build doivent passer.
- Avant d'écrire du code Next.js ou next-intl, consulter la documentation à jour via context7 (Next 15, next-intl 4) : leurs API ont changé par rapport aux versions précédentes.

## Règles de design (direction « Nuit », validée)
- **Aucun effet de mouvement au survol** : pas de curseur personnalisé, pas d'élément qui bouge ou grossit. Au survol, seulement des changements de couleur.
- Animations autorisées : apparition au défilement (`<Reveal>`), titres ligne à ligne, diaporama du hero, bandeau défilant. Toujours respecter `prefers-reduced-motion`.
- Jetons et composants dans `src/app/globals.css` (classes `.btn`, `.card`, `.kick`, `.h2`, `.sf`…). Réutilise-les avant d'ajouter du style.
- Pas de `-webkit-text-stroke` sur les polices variables (traits parasites).
- Le contenu doit rester visible sans JavaScript (la classe `js` sur `<html>` active les fondus).

## Textes et traductions
- Tout texte visible vient de `messages/fr.json` et `messages/en.json` : **mêmes clés dans les deux fichiers**.
- Apostrophe typographique `’` obligatoire dans les messages (l'apostrophe droite `'` casse le format ICU, par ex. `d'<acc>`).
- En français, espace insécable avant `?`, `!`, `;` et après `«`.
- Balises de texte riche : `<acc>` (italique vert), `<warn>`, `<br></br>`, via `t.rich(clé, rich)` (`src/lib/rich.tsx`).

## Données et honnêteté
- Seuils DPE à jour de la réforme 2026 (électricité 1,9) : `src/lib/dpe.ts`. Ne pas les modifier sans source officielle.
- Le mode démonstration (`src/lib/demo.ts`) ne doit jamais se faire passer pour un vrai résultat : le bandeau « Mode démonstration » reste affiché.
- Ne jamais inventer de chiffres (nombre de DPE, précision du modèle, délais de réponse) : laisser un `[À COMPLÉTER]`.
- Email de contact : depret97.ryan@gmail.com (dans `src/lib/site.ts`).

## Ajouter une page
1. `src/app/[locale]/ma-page/page.tsx` avec `setRequestLocale` et `generateMetadata` via `pageMetadata` (`src/lib/seo.ts`).
2. Textes dans les deux fichiers de messages (+ `meta.<page>`).
3. Ajouter le chemin dans `src/app/sitemap.ts`, et dans le Header/Footer si besoin.
4. Rendre `<Footer />` en fin de page.
