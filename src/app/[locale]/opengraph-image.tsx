import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'EnergyHome AI';

const CLASSES = [['A', '#009C6D'], ['B', '#52B153'], ['C', '#A5CC74'], ['D', '#F4E70F'], ['E', '#F0B50F'], ['F', '#EB8235'], ['G', '#D7221F']];

/** Image de partage (réseaux sociaux), générée au build pour chaque langue. */
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B1712', color: '#EEF4F0', padding: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 48 48">
            <path d="M7 41 A28 28 0 0 1 41 7 A28 28 0 0 1 7 41 Z" fill="#7FD8B2" />
            <path d="M16 29L24 21L32 29" stroke="#0B1712" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 21V34" stroke="#0B1712" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5 }}>EnergyHome AI</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 1000 }}>{t('title').split(' — ')[1] ?? t('title')}</div>
          <div style={{ fontSize: 26, color: '#A9BDB3', maxWidth: 940, lineHeight: 1.4 }}>{t('description')}</div>
        </div>
        <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden' }}>
          {CLASSES.map(([c, col]) => <div key={c} style={{ flex: 1, background: col }} />)}
        </div>
      </div>
    ),
    size,
  );
}
