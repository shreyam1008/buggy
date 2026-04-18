interface Portal {
  id: string;
  label: string;
  emoji: string;
  colorA: string;
  colorB: string;
  glow: string;
}

const PORTALS: Portal[] = [
  { id: 'code',      label: 'Code',       emoji: '⌨️', colorA: '#58a6ff', colorB: '#0b1220', glow: 'rgba(88,166,255,0.6)' },
  { id: 'spiritual', label: 'Bhakti',     emoji: '🪷', colorA: '#f6c667', colorB: '#5a1f0a', glow: 'rgba(246,198,103,0.6)' },
  { id: 'outdoors',  label: 'Outdoors',   emoji: '🥾', colorA: '#ff8c42', colorB: '#4a1f06', glow: 'rgba(255,140,66,0.6)' },
  { id: 'iron',      label: 'Iron',       emoji: '🏋️', colorA: '#ff4444', colorB: '#3a0000', glow: 'rgba(255,68,68,0.6)' },
  { id: 'mind',      label: 'Mind',       emoji: '🔮', colorA: '#b794f4', colorB: '#1e0b4a', glow: 'rgba(183,148,244,0.6)' },
  { id: 'arena',     label: 'Arena',      emoji: '🎮', colorA: '#00ff88', colorB: '#052e16', glow: 'rgba(0,255,136,0.6)' },
  { id: 'cluster',   label: 'Connect',    emoji: '🌐', colorA: '#f5b7d5', colorB: '#3a0f1f', glow: 'rgba(245,183,213,0.6)' },
];

export default function CosmicHub() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="me-hub me-scene" aria-label="The Many Worlds of Shreyam">
      <div className="relative text-center z-10" style={{ marginBottom: 'clamp(24px, 4vh, 48px)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.4em', opacity: 0.55, textTransform: 'uppercase' }}>
          Shreyam Adhikari · shreyam1008 · buggythegret
        </div>
        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 84px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          margin: '12px 0 8px',
          background: 'linear-gradient(135deg, #fde68a 0%, #f472b6 50%, #b794f4 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
          The<br />Many Worlds
        </h1>
        <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', opacity: 0.7, maxWidth: '42ch', margin: '0 auto' }}>
          Code is the base. Everything else is dessert. Pick a portal — or scroll to tour them all.
        </p>
      </div>

      <div className="me-orbit-tilt" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="me-orbit">
          {PORTALS.map((p, i) => (
            <button
              key={p.id}
              className="me-portal"
              style={{
                ['--i' as string]: i,
                ['--portal-color-1' as string]: p.colorA,
                ['--portal-color-2' as string]: p.colorB,
                ['--portal-glow' as string]: p.glow,
              } as React.CSSProperties}
              onClick={() => scrollTo(p.id)}
              aria-label={`Jump to ${p.label} chapter`}
            >
              <div className="me-portal-counter">
                <div className="me-portal-disk">
                  <span aria-hidden="true">{p.emoji}</span>
                </div>
                <div className="me-portal-label">{p.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Central core — the "me" */}
      <div className="me-core" aria-hidden="true">
        SA
      </div>

      <div className="me-scroll-hint" aria-hidden="true">
        ↓ scroll to enter ↓
      </div>
    </section>
  );
}
