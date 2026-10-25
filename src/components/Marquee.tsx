import { Fragment } from 'react';
import { Spark } from './Icons';

/** Bandeau défilant (contenu doublé pour une boucle sans couture, masqué aux lecteurs d'écran). */
export function Marquee({ items }: { items: string[] }) {
  const row = (dup: boolean) =>
    items.map((it, k) => (
      <Fragment key={`${dup}-${k}`}>
        <span className={k % 2 ? 'outl' : undefined}>{k % 2 ? it : <span>{it}</span>}</span>
        <span className="acc" style={{ display: 'flex' }}><Spark size={34} /></span>
      </Fragment>
    ));
  return (
    <div className="mq-wrap" aria-hidden="true">
      <div className="mq">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
