import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// En production Vercel, l'URL publique doit être définie (SEO, sitemap, canoniques, image de partage).
// En local et sur les aperçus, le repli http://localhost:3000 de src/lib/site.ts reste utilisé.
if (process.env.VERCEL_ENV === 'production') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl || siteUrl.includes('localhost')) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL ${siteUrl ? `vaut « ${siteUrl} »` : 'est absente'} alors que VERCEL_ENV=production. ` +
        'Définis-la dans Vercel (Settings → Environment Variables, environnement Production) avec l’URL publique du site, ' +
        'par exemple https://energyhome.ai, puis relance le déploiement.',
    );
  }
}

const securityHeaders = [
  // Uniquement frame-ancestors : une CSP complète bloquerait les scripts de Next.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // Image Docker légère (voir Dockerfile)
  output: 'standalone',
  images: { formats: ['image/avif', 'image/webp'] },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
