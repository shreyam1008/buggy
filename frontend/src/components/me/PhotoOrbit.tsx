import { useEffect, useState } from 'react';

export interface OrbitPhoto {
  /** Absolute path, e.g. "/me/photos/hike-1.jpg". Can be a .svg, .jpg, .webp etc. */
  src?: string;
  /** Alt text + caption shown when expanded */
  alt: string;
  /** Optional separate caption for expanded view. Falls back to alt. */
  caption?: string;
  /** Optional accent hex for the ring glow. Defaults to chapter accent. */
  accent?: string;
}

interface Props {
  /** Photos to orbit. Empty entries render a placeholder slot. */
  photos: OrbitPhoto[];
  /** Central scene (icon / 3D illustration). Renders behind the orbit. */
  children: React.ReactNode;
  /** Orbit radius in px at desktop size. Default 160. */
  radius?: number;
  /** Orbit speed in seconds for full revolution. Default 28. */
  speed?: number;
  /** Thumbnail diameter in px. Default 72. */
  size?: number;
  /** Orbit rotation direction */
  direction?: 'cw' | 'ccw';
  /** Optional hint shown if any photo is missing a src */
  placeholderHint?: string;
}

/**
 * PhotoOrbit — A ring of circular photo thumbnails orbiting a central scene.
 * Click a photo to trigger the "bloom" expansion: the thumbnail scales up,
 * un-rolls from circle into a framed rectangle rotating on Y, while the
 * other photos fade and the backdrop darkens. ESC or backdrop click closes.
 *
 * If a photo has no `src`, a dashed placeholder renders with the filename hint
 * so the owner can drop a real image into /public/me/photos/ later without
 * touching code structure.
 */
export default function PhotoOrbit({
  photos,
  children,
  radius = 160,
  speed = 28,
  size = 72,
  direction = 'cw',
  placeholderHint = 'Drop photos into /public/me/photos/',
}: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // ESC closes the expanded view
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

  const count = Math.max(photos.length, 1);
  const step = 360 / count;
  const dirSign = direction === 'cw' ? 1 : -1;

  const expanded = expandedIdx !== null ? photos[expandedIdx] : null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* Center scene — the chapter's signature illustration */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>

        {/* Orbiting photo ring */}
        <div
          className="me-photo-orbit"
          style={{
            ['--orbit-speed' as string]: `${speed}s`,
            ['--orbit-dir' as string]: dirSign,
            position: 'relative',
            width: radius * 2,
            height: radius * 2,
            transformStyle: 'preserve-3d',
          }}
          aria-hidden="false"
        >
          {photos.map((p, i) => {
            const angle = i * step;
            const isExpanded = expandedIdx === i;
            const hasSrc = !!p.src;
            return (
              <button
                key={i}
                className={`me-photo-thumb ${isExpanded ? 'is-expanded' : ''}`}
                style={{
                  ['--angle' as string]: `${angle}deg`,
                  ['--r' as string]: `${radius}px`,
                  ['--size' as string]: `${size}px`,
                  ['--accent' as string]: p.accent ?? 'var(--chapter-accent, #fde68a)',
                  opacity: expandedIdx !== null && !isExpanded ? 0.15 : 1,
                  pointerEvents: expandedIdx !== null && !isExpanded ? 'none' : 'auto',
                } as React.CSSProperties}
                onClick={() => setExpandedIdx(i)}
                aria-label={p.alt || `Photo ${i + 1}`}
                title={p.alt}
              >
                <span className="me-photo-counter">
                  {hasSrc ? (
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <span className="me-photo-placeholder">
                      <span style={{ fontSize: 20 }}>📷</span>
                      <span style={{ fontSize: 9, opacity: 0.7, lineHeight: 1.1, wordBreak: 'break-all' }}>
                        {p.alt}
                      </span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded viewer — unique bloom: circle → rotated rectangle framed in gold */}
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
              {expanded.src ? (
                <img
                  src={expanded.src}
                  alt={expanded.alt}
                  className="me-photo-bloom-img"
                  draggable={false}
                />
              ) : (
                <div className="me-photo-bloom-placeholder">
                  <div style={{ fontSize: 64 }}>📷</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 12 }}>{expanded.alt}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>
                    {placeholderHint}
                  </div>
                </div>
              )}
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
