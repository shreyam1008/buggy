import PhotoOrbit, { type OrbitPhoto } from './PhotoOrbit';

/**
 * ChapterOutdoors — the merged "III · The Long Way" world covering BOTH
 * cycling (100 km events, Strava) and hiking (mountains, trails, altitude).
 * The right-side scene is a perspective road/trail with a PhotoOrbit ring
 * around it, ready for real photos dropped at /public/me/photos/.
 */

// Empty `src` renders a dashed "drop your photo here" placeholder, so the
// whole thing is a finished design that gets richer when files land in
// /public/me/photos/ — no code changes required later.
const PHOTOS: OrbitPhoto[] = [
  { src: '/me/photos/hike-1.jpg',  alt: 'hike-1.jpg',  caption: 'A trail, somewhere above the cloud line.' },
  { src: '/me/photos/ride-1.jpg',  alt: 'ride-1.jpg',  caption: 'KM 70. Legs filed a formal complaint.' },
  { src: '/me/photos/hike-2.jpg',  alt: 'hike-2.jpg',  caption: 'Switchbacks. Breath. Small wins.' },
  { src: '/me/photos/ride-2.jpg',  alt: 'ride-2.jpg',  caption: 'Century finish. Tasted like iron and juice.' },
  { src: '/me/photos/hike-3.jpg',  alt: 'hike-3.jpg',  caption: 'Summit view. Worth the knee noises.' },
  { src: '/me/photos/ride-3.jpg',  alt: 'ride-3.jpg',  caption: 'Sunrise roll-out. Peak feeling.' },
];

export default function ChapterOutdoors() {
  return (
    <section
      id="chapter-outdoors"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #ff8c42 0%, #f97316 40%, #fde047 80%, #4ade80 100%)',
        ['--chapter-accent' as string]: '#ff8c42',
      } as React.CSSProperties}
      aria-labelledby="chapter-outdoors-title"
    >
      <div>
        <div className="me-chapter-kicker">III · The Long Way</div>
        <h2 id="chapter-outdoors-title" className="me-chapter-title">Trail<br />&amp; Tarmac</h2>
        <p className="me-chapter-lede">
          <strong>Two legs, two wheels, one attitude.</strong> Multiple{' '}
          <strong>100 km cycling events</strong> finished — Strava has receipts.
          Multiple <strong>hikes</strong> where the only plan was "up". I go
          where the phone signal gets shy and the playlist runs out; that's
          usually where my head clears.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.78 }}>
          Cycling teaches you <em>pacing</em>. Hiking teaches you{' '}
          <em>patience</em>. Both teach you that the thing you were worrying
          about at kilometre 2 is hilariously irrelevant by kilometre 40.
          That's the actual return on investment.
        </p>
        <div style={{ marginTop: 24 }}>
          <span className="me-chapter-stat"><b>100 km+</b><span>Bike events · done</span></span>
          <span className="me-chapter-stat"><b>↑</b><span>Preferred direction</span></span>
          <span className="me-chapter-stat"><b>N+1</b><span>Optimal bike count</span></span>
          <span className="me-chapter-stat"><b>0</b><span>Regrets · post-ride/hike</span></span>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://www.strava.com/athletes/113238146" target="_blank" rel="noopener noreferrer">
            🚴 Follow on Strava
          </a>
          <span
            className="me-cta me-cta-ghost"
            style={{ cursor: 'default' }}
            aria-hidden="true"
          >
            🥾 Hiking · on foot, off grid
          </span>
        </div>
      </div>

      {/* Scene panel — road + trail fusion with a PhotoOrbit wrapping it */}
      <div className="me-scene-panel" aria-hidden="false">
        <PhotoOrbit
          photos={PHOTOS}
          radius={180}
          size={72}
          speed={38}
          placeholderHint="Drop JPG/WebP files into /frontend/public/me/photos/"
        >
          {/* The signature scene stays in the center */}
          <div className="me-road" style={{ width: 280, height: 280, borderRadius: '50%' }}>
            <div className="me-road-sun" />
            <div className="me-road-floor" />
            {/* Small mountain silhouette for hiking vibe */}
            <svg
              viewBox="0 0 200 120"
              style={{
                position: 'absolute',
                bottom: '38%',
                left: 0,
                width: '100%',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <path d="M0 120 L30 70 L60 95 L95 40 L130 80 L160 55 L200 90 L200 120 Z"
                fill="#1a1a2e" opacity="0.85" />
              <path d="M0 120 L35 80 L70 100 L110 60 L145 95 L175 72 L200 100 L200 120 Z"
                fill="#0a0a1a" opacity="0.9" />
            </svg>
            <svg
              viewBox="0 0 120 80"
              style={{
                position: 'absolute',
                bottom: '18%',
                left: '50%',
                width: '42%',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
              }}
              aria-hidden="true"
            >
              <circle cx="25" cy="60" r="14" stroke="#fde047" strokeWidth="2" fill="none" />
              <circle cx="25" cy="60" r="2" fill="#fde047" />
              <circle cx="85" cy="60" r="14" stroke="#fde047" strokeWidth="2" fill="none" />
              <circle cx="85" cy="60" r="2" fill="#fde047" />
              <path d="M25 60 L55 60 L70 35 L85 60 M55 60 L60 30 L70 35 L50 20"
                stroke="#fde047" strokeWidth="2" fill="none" />
              <circle cx="50" cy="12" r="6" fill="#0f172a" />
              <path d="M50 18 L52 30 L60 30 L55 45 L62 50 L70 35 M55 30 L40 22"
                stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            <div style={{
              position: 'absolute',
              top: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,140,66,0.4)',
              fontSize: 10,
              fontWeight: 800,
              color: '#ff8c42',
              letterSpacing: '0.14em',
              whiteSpace: 'nowrap',
            }}>
              KM 87 · ALT 3180 m
            </div>
          </div>
        </PhotoOrbit>
      </div>
    </section>
  );
}
