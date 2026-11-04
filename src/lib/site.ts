/**
 * Coordonnées et liens du site, à un seul endroit.
 * En production (Vercel), NEXT_PUBLIC_SITE_URL est obligatoire : next.config.ts arrête le build sinon.
 */
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  email: 'depret97.ryan@gmail.com',
  author: 'Ryan Depret',
  linkedin: 'https://www.linkedin.com/in/ryan-depret/',
  github: 'https://github.com/RyanDepret',
  repo: 'https://github.com/RyanDepret/energy-home-ai',
  ademe: 'https://data.ademe.fr/datasets/dpe03existant',
};
