/**
 * Logo « feuille-maison » : une feuille dont la nervure dessine un toit.
 * La feuille pousse, puis le toit et la nervure se tracent au chargement (désactivé si `still`).
 */
export function LogoMark({ size = 34, still = false }: { size?: number; still?: boolean }) {
  return (
    <svg className={still ? 'mk static' : 'mk'} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path className="mk-leaf" d="M7 41 A28 28 0 0 1 41 7 A28 28 0 0 1 7 41 Z" fill="#7FD8B2" />
      <path d="M2.5 45.5L9.5 38.5" stroke="#7FD8B2" strokeWidth="3.4" strokeLinecap="round" />
      <path className="mk-roof" d="M16 29L24 21L32 29" stroke="#0B1712" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path className="mk-vein" d="M24 21V34" stroke="#0B1712" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="wm" style={{ fontSize: size }}>
      Energy<span className="sf">Home</span>
      <span className="wm-ai">AI</span>
    </span>
  );
}

export function Logo({ size = 22, still = false }: { size?: number; still?: boolean }) {
  return (
    <>
      <LogoMark size={Math.round(size * 1.55)} still={still} />
      <Wordmark size={size} />
    </>
  );
}
