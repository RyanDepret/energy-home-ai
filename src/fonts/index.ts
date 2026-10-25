import localFont from 'next/font/local';

/**
 * Polices auto-hébergées (sous-ensemble latin, licence SIL OFL).
 * Aucun appel à Google Fonts au build ni à l'exécution : build reproductible en Docker,
 * et aucune adresse IP de visiteur transmise à un tiers (RGPD).
 */
export const inter = localFont({ src: './inter-latin-wght-normal.woff2', variable: '--font-inter', weight: '100 900', display: 'swap' });
export const manrope = localFont({ src: './manrope-latin-wght-normal.woff2', variable: '--font-manrope', weight: '200 800', display: 'swap' });
export const jetbrains = localFont({ src: './jetbrains-mono-latin-wght-normal.woff2', variable: '--font-jetbrains', weight: '100 800', display: 'swap' });
export const instrument = localFont({ src: './instrument-serif-latin-400-italic.woff2', variable: '--font-instrument', weight: '400', style: 'italic', display: 'swap' });

export const fontVariables = [inter.variable, manrope.variable, jetbrains.variable, instrument.variable].join(' ');
