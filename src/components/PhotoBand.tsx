import Image from 'next/image';
import type { ReactNode } from 'react';

type Props = {
  src: string;
  kick: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  position?: string;
  before?: ReactNode;
  after?: ReactNode;
};

/** Bandeau photo plein cadre en tête des pages intérieures (titre animé ligne à ligne). */
export function PhotoBand({ src, kick, title, lead, position = 'center', before, after }: Props) {
  return (
    <section className="photo band">
      <div className="photo-img slowzoom">
        <Image src={src} alt="" fill priority sizes="100vw" style={{ objectPosition: position }} />
      </div>
      <div className="shade" />
      <div className="grain" />
      <div className="band-in wrap">
        {before}
        <p className="kick fade" style={{ color: '#ffffff' }}>{kick}</p>
        <h1 className="disp band-title">
          <span className="ln"><span>{title}</span></span>
        </h1>
        {lead && <p className="band-p fade">{lead}</p>}
        {after}
      </div>
    </section>
  );
}
