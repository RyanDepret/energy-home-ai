import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CLASSES } from '@/lib/dpe';
import { rich } from '@/lib/rich';
import { SITE } from '@/lib/site';
import { Logo } from './Logo';
import { ArrowUp, ArrowUpRight } from './Icons';

/** Pied de page commun. Sur la page Contact, l'appel « Parlons-en » devient « Avant de partir ». */
export async function Footer({ variant = 'default' }: { variant?: 'default' | 'contact' }) {
  const t = await getTranslations('footer');
  const n = await getTranslations('nav');
  const year = new Date().getFullYear();

  const explore = [
    { href: '/simulateur', label: n('simulator') },
    { href: '/assistant', label: n('assistant') },
    { href: '/a-propos', label: n('about') },
    { href: '/contact', label: n('contact') },
  ] as const;
  const follow = [
    { href: SITE.linkedin, label: 'LinkedIn' },
    { href: SITE.github, label: 'GitHub' },
    { href: SITE.ademe, label: t('ademe') },
  ];

  return (
    <footer className="ftr">
      <div className="rib" aria-hidden="true">
        {CLASSES.map((c) => <span key={c} style={{ background: `var(--c${c})` }} />)}
      </div>
      <div className="wrap" style={{ paddingTop: 'clamp(72px, 9vw, 120px)', paddingBottom: 36 }}>
        <div className="ftr-grid">
          {variant === 'contact' ? (
            <div>
              <p className="kick">{t('leaveKick')}</p>
              <p className="h2 ftr-title">{t.rich('leaveTitle', rich)}</p>
              <p className="lead" style={{ marginTop: 20, maxWidth: 460 }}>{t('leaveText')}</p>
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <Link href="/simulateur" className="btn">
                  {t('estimate')}
                  <span className="ic"><ArrowUpRight /></span>
                </Link>
                <Link href="/assistant" className="btn-o">{t('ask')}</Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="kick">{t('talkKick')}</p>
              <p className="h2 ftr-title">{t.rich('talkTitle', rich)}</p>
              <a href={`mailto:${SITE.email}`} className="lk lk-u" style={{ display: 'inline-block', marginTop: 40, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(20px, 2.4vw, 30px)', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
                {SITE.email}
              </a>
            </div>
          )}

          <div>
            <div className="ftr-cols">
              <nav aria-label={t('explore')}>
                <p className="kick muted">{t('explore')}</p>
                <div style={{ marginTop: 14 }}>
                  {explore.map((l, i) => (
                    <Link key={l.href} href={l.href} className="row-link">
                      <span><small>0{i + 1}</small>{l.label}</span>
                    </Link>
                  ))}
                </div>
              </nav>
              <div>
                <p className="kick muted">{t('follow')}</p>
                <div style={{ marginTop: 14 }}>
                  {follow.map((l) => (
                    <a key={l.href} href={l.href} className="row-link" target="_blank" rel="noopener noreferrer">
                      {l.label}
                      <ArrowUpRight />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Image src="/images/ryan.jpg" alt="" width={56} height={56} style={{ borderRadius: 999, objectFit: 'cover', width: 56, height: 56 }} />
              <p className="small">
                {t('builtBy')} <strong style={{ color: 'var(--ink)' }}>Ryan</strong>
                <br />
                {t('role')}
              </p>
            </div>
          </div>
        </div>

        <div className="ftr-bottom">
          <Link href="/" className="logo" aria-label={n('homeLabel')} style={{ color: 'var(--ink)' }}>
            <Logo size={18} still />
          </Link>
          <span>{t('rights', { year })}</span>
          <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }} aria-label={t('legal')}>
            <Link href="/mentions-legales" className="lk">{t('legal')}</Link>
            <Link href="/confidentialite" className="lk">{t('privacy')}</Link>
            <Link href="/credits" className="lk">{t('credits')}</Link>
          </nav>
          <a href="#main" className="top-btn">
            <span className="sr-only">{t('top')}</span>
            <ArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
}
