import { useEffect, useState } from 'react';

export interface OrbitPhoto {
  /** Absolute URL, e.g. "/me/photos/hike-1.jpg". Entries without src are skipped. */
  src?: string;
  /** Alt text + default caption */
  alt: string;
  /** Optional separate caption for expanded view */
  caption?: string;
  /** Optional accent hex for ring glow. Defaults to chapter accent. */
  accent?: string;
}

interface Props {
  photos: OrbitPhoto[];
  /** The chapter's signature icon/scene — always rendered, untouched */
  children: React.ReactNode;
  /** Orbit radius in px. Default 210 — well outside typical icon bounds. */
  radius?: number;
  /** Full revolution duration in seconds. Default 38. */
  speed?: number;
  /** Thumbnail diameter in px. Default 52. */
  size?: number;
  direction?: 'cw' | 'ccw';
}

/**
 * PhotoOrbit — Decorates a chapter's icon with an optional orbiting photo ring.
 *
 * Zero photos = renders ONLY the children (icon untouched, no overhead).
 * One photo  = that single thumb orbits alone at a wide radius.
 * N photos   = evenly-spaced thumbs orbit together.
 *
 * The wrapper has pointer-events:none so the icon stays fully interactive;
 * only the thumb buttons re-enable pointer events. Click a thumb → bloom
 * expansion (scale + rotateY + border-radius morph, rotating ray halo).
 */
export default function PhotoOrbit({
  photos,
  children,
  radius = 210,
  speed = 38,
  size = 52,
  direction = 'cw',
}: Props) {
  const real = photos.filter((p) => p && p.src);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (expandedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedIdx(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expandedIdx]);

  const count = real.length;

  // No real photos → pass-through. Icon stays fully intact, no ring, no overhead.
  if (count === 0) return <>{children}</>;

  const step = 360 / count;
  const dirSign = direction === 'cw' ? 1 : -1;
  const expanded = expandedIdx !== null ? real[expandedIdx] : null;

  return (
    <>
      {children}

      <div
        className="me-photo-orbit-wrap"
        style={{
          ['--orbit-speed' as string]: `${speed}s`,
          ['--orbit-dir' as string]: dirSign,
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          zIndex: 20,
        } as React.CSSProperties}
      >
        <div
          className="me-photo-orbit"
          style={{
            position: 'relative',
            width: radius * 2,
            height: radius * 2,
            transformStyle: 'preserve-3d',
          }}
        >
          {real.map((p, i) => {
            const angle = i * step;
            const isExpanded = expandedIdx === i;
            return (
              <button
                key={i}
                className={`me-photo-thumb ${isExpanded ? 'is-expanded' : ''}`}
                style={{
                  ['--angle' as string]: `${angle}deg`,
                  ['--r' as string]: `${radius}px`,
                  ['--size' as string]: `${size}px`,
                  ['--accent' as string]: p.accent ?? 'var(--chapter-accent, #fde68a)',
                  opacity: expandedIdx !== null && !isExpanded ? 0.2 : 0.85,
                  pointerEvents: expandedIdx !== null && !isExpanded ? 'none' : 'auto',
                } as React.CSSProperties}
                onClick={() => setExpandedIdx(i)}
                aria-label={p.alt || `Photo ${i + 1}`}
                title={p.alt}
              >
                <span className="me-photo-counter">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {expanded && (
        <div
          className="me-photo-backdrop"
          onClick={() => setExpandedIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={expanded.alt}
        >
          <div
            className="me-photo-bloom"
            onClick={(e) => e.stopPropagation()}
            style={{
              ['--accent' as string]: expanded.accent ?? 'var(--chapter-accent, #fde68a)',
            } as React.CSSProperties}
          >
            <div className="me-photo-bloom-inner">
              <img
                src={expanded.src}
                alt={expanded.alt}
                className="me-photo-bloom-img"
                draggable={false}
              />
            </div>
            <div className="me-photo-bloom-caption">
              {expanded.caption ?? expanded.alt}
            </div>
            <button
              type="button"
              className="me-photo-bloom-close"
              onClick={() => setExpandedIdx(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
