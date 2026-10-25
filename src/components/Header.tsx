'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Logo } from './Logo';
import { ArrowUpRight, Close, Menu } from './Icons';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/simulateur', key: 'simulator' },
  { href: '/assistant', key: 'assistant' },
  { href: '/a-propos', key: 'about' },
] as const;

function LangSwitch() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const change = (next: Locale) => {
    if (next === locale) return;
    // On conserve les paramètres (ex. : la simulation en cours) en changeant de langue.
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`${pathname}${qs}`, { locale: next, scroll: false });
  };
  return (
    <div className="lang" data-locale={locale} role="group" aria-label={t('language')}>
      <span className="lang-pill" aria-hidden="true" />
      {routing.locales.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => change(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ferme le menu mobile au changement de page, bloque le défilement et gère Échap.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <header className={scrolled ? 'hdr is-scrolled' : 'hdr'}>
        <div className="hdr-in">
          <Link href="/" className="logo" aria-label={t('homeLabel')}>
            <Logo size={22} />
          </Link>
          <nav className="nav" aria-label={t('main')}>
            {LINKS.map((l, i) => (
              <Link key={l.href} href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
                <sup>0{i + 1}</sup>
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="hdr-actions">
            <LangSwitch />
            <Link href="/contact" className="pill-c" aria-current={isCurrent('/contact') ? 'page' : undefined}>
              {t('contact')}
              <i><ArrowUpRight size={14} /></i>
            </Link>
            <button type="button" className="burger" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(true)}>
              <span className="sr-only">{t('menu')}</span>
              <Menu />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div id="mnav" className="mnav" role="dialog" aria-modal="true" aria-label={t('main')}>
          <button type="button" className="burger mnav-close" style={{ display: 'inline-flex' }} onClick={() => setOpen(false)}>
            <span className="sr-only">{t('close')}</span>
            <Close />
          </button>
          {[...LINKS, { href: '/contact', key: 'contact' } as const].map((l, i) => (
            <Link key={l.href} href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
              {t(l.key)}
              <small>0{i + 1}</small>
            </Link>
          ))}
          <LangSwitch />
        </div>
      )}
    </>
  );
}
