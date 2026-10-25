import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from '@/components/Icons';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <main id="main" style={{ minHeight: '100svh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap">
        <p className="kick">404</p>
        <h1 className="disp" style={{ marginTop: 22, fontSize: 'clamp(56px, 9vw, 140px)' }}>
          {t('title')} <span className="sf acc">{t('accent')}</span>
        </h1>
        <p className="lead" style={{ marginTop: 24, maxWidth: 520 }}>{t('text')}</p>
        <Link href="/" className="btn" style={{ marginTop: 40 }}>
          {t('home')}<span className="ic"><ArrowUpRight /></span>
        </Link>
      </div>
    </main>
  );
}
