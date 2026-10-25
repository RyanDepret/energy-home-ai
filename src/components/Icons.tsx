/** Icônes au trait, dessinées pour le projet. Décoratives par défaut (aria-hidden). */
type P = { size?: number };

export function ArrowUpRight({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 11.5l7-7M6 4.5h5.5V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ArrowRight({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ArrowLeft({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ArrowUp({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Check({ size = 12 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Pause({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="4" y="3" width="2.6" height="10" rx="1" fill="currentColor" />
      <rect x="9.4" y="3" width="2.6" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}
export function Play({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3.2v9.6a.6.6 0 00.9.5l7.4-4.8a.6.6 0 000-1L5.9 2.7a.6.6 0 00-.9.5z" fill="currentColor" />
    </svg>
  );
}
export function Menu({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function Close({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function Spark({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5l1.7 4.6 4.8 1.4-4.8 1.6L10 14.8 8.3 10.1 3.5 8.5l4.8-1.4L10 2.5z" fill="currentColor" />
      <path d="M15.5 13.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" fill="currentColor" />
    </svg>
  );
}
export function Info({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}>
      <circle cx="9" cy="9" r="7.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8.2v4.3M9 5.6v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
export function Doc({ size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 1.5h4.6L11 4.4v8.1H3.5v-11z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 1.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
