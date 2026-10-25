'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { rich } from '@/lib/rich';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from './Icons';

const IMAGES = [
  { src: '/images/mas-provencal.jpg', pos: 'center 60%' },
  { src: '/images/maison-pierre-crepuscule.jpg', pos: 'center 55%' },
  { src: '/images/salon.jpg', pos: 'center 50%' },
];
const DURATION = 7000;

/** Hero en diaporama : 3 messages, progression visible, pause au clavier et pour les lecteurs d'écran. */
export function HeroSlider() {
  const t = useTranslations('home');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);

  const go = useCallback((n: number) => {
    setI((cur) => {
      const next = (n + IMAGES.length) % IMAGES.length;
      setSeen((s) => (next === 0 ? [] : [...new Set([...s, cur])]));
      return next;
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, go]);

  const badge = t('badge');

  return (
    <section className={paused ? 'photo hero paused' : 'photo hero'} aria-roledescription="carousel" aria-label={t('carousel')}>
      {IMAGES.map((img, k) =>
        k === i ? (
          <div key={`${k}-${i}`} className="photo-img kb">
            <Image src={img.src} alt="" fill priority={k === 0} sizes="100vw" style={{ objectPosition: img.pos }} />
          </div>
        ) : null,
      )}
      <div className="shade" />
      <div className="grain" />

      <div className="hero-in">
        <div key={i} role="group" aria-roledescription="slide" aria-label={t('slideOf', { n: i + 1 })} style={{ maxWidth: 980 }}>
          <p className="kick fade" style={{ color: '#ffffff' }}>{t(`slides.${i}.kick`)}</p>
          <h1 className="disp hero-title">
            <span className="ln"><span>{t(`slides.${i}.l1`)}</span></span>
            <span className="ln"><span>{t.rich(`slides.${i}.l2`, rich)}</span></span>
          </h1>
          <p className="hero-p fade">{t(`slides.${i}.p`)}</p>

          <div className="hero-ctrl">
            <button type="button" className="circ" onClick={() => go(i - 1)}>
              <span className="sr-only">{t('prev')}</span>
              <ArrowLeft />
            </button>
            <div role="group" aria-label={t('pick')} style={{ flex: 1, display: 'flex', gap: 10 }}>
              {IMAGES.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  className={seen.includes(k) && k !== i ? 'prog done' : 'prog'}
                  aria-current={k === i ? 'true' : undefined}
                  onClick={() => go(k)}
                >
                  <span className="sr-only">{t('slideOf', { n: k + 1 })}</span>
                  <i key={k === i ? `on-${i}` : 'off'} />
                </button>
              ))}
            </div>
            <span className="mono" style={{ fontSize: 13, color: '#c8d6cf' }} aria-hidden="true">0{i + 1} / 03</span>
            <button type="button" className="circ" onClick={() => setPaused((p) => !p)}>
              <span className="sr-only">{paused ? t('play') : t('pause')}</span>
              {paused ? <Play /> : <Pause />}
            </button>
            <button type="button" className="circ solid" onClick={() => go(i + 1)}>
              <span className="sr-only">{t('next')}</span>
              <ArrowRight />
            </button>
          </div>
        </div>

        <div className="hero-side">
          <Link href="/simulateur" className="badge" aria-label={t('badge')}>
            <svg viewBox="0 0 172 172" width="172" height="172" aria-hidden="true">
              <defs><path id="badge-c" d="M86 86m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0" /></defs>
              <text fill="currentColor" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <textPath href="#badge-c">{badge}</textPath>
              </text>
            </svg>
            <span><ArrowUpRight size={26} /></span>
          </Link>
          <div className="scroll-cue" aria-hidden="true">
            <span className="kick">{t('scroll')}</span>
            <span className="scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
