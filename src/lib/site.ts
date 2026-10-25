/**
 * Coordonnées et liens du site, à un seul endroit.
 * À COMPLÉTER : remplace les liens LinkedIn et GitHub par tes vraies adresses avant la mise en ligne.
 */
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  email: 'depret97.ryan@gmail.com',
  author: 'Ryan Depret',
  linkedin: 'https://www.linkedin.com/in/A-COMPLETER',
  github: 'https://github.com/A-COMPLETER',
  repo: 'https://github.com/A-COMPLETER/energyhome-ai',
  ademe: 'https://data.ademe.fr',
};
