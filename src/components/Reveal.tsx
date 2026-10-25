'use client';

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type Tag = 'div' | 'li' | 'section' | 'figure' | 'p';

/**
 * Observe l'élément et lui ajoute la classe `in` (et `in-view`) quand il entre à l'écran.
 * Le contenu est visible par défaut dans le HTML : il n'est masqué qu'une fois JavaScript actif
 * (classe `js` sur <html>). Le référencement, l'absence de JS et `prefers-reduced-motion` restent couverts.
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in', 'in-view');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Apparition au défilement (fondu + légère montée), une seule fois. Aucun effet au survol. */
export function Reveal({ children, delay = 0, className, as = 'div', style }: { children: ReactNode; delay?: number; className?: string; as?: Tag; style?: CSSProperties }) {
  const ref = useInView<HTMLElement>();
  return createElement(
    as,
    { ref, className: className ? `rv ${className}` : 'rv', style: delay ? { ...style, transitionDelay: `${delay}s` } : style },
    children,
  );
}

/** Ajoute seulement `in-view` (pour les traits `.draw` qui se tracent), sans fondu. */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useInView<HTMLDivElement>();
  return <div ref={ref} className={className}>{children}</div>;
}
