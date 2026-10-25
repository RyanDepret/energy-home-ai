import type { ReactNode } from 'react';

/** Balises des textes riches (`t.rich`) : <acc> accent italique, <warn> alerte, <br></br> retour à la ligne. */
export const rich = {
  acc: (c: ReactNode) => <span className="sf acc">{c}</span>,
  warn: (c: ReactNode) => <span className="sf" style={{ color: 'var(--cF)' }}>{c}</span>,
  br: () => <br />,
};
