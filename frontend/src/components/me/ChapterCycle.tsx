export default function ChapterCycle() {
  return (
    <section
      id="chapter-cycle"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #ff8c42 0%, #f97316 50%, #fde047 100%)',
        ['--chapter-accent' as string]: '#ff8c42',
      } as React.CSSProperties}
      aria-labelledby="chapter-cycle-title"
    >
      <div>
        <div className="me-chapter-kicker">III · The Legs</div>
        <h2 id="chapter-cycle-title" className="me-chapter-title">Velocity<br />Lane</h2>
        <p className="me-chapter-lede">
          <strong>100 km events? Completed. Multiple.</strong> My Strava says so.
          My legs say it was a mistake but we don't listen to them anymore —
          they've been outvoted by the CS:GO quads and the gym chalk.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          There is a specific kind of peace you get at kilometre 70 when the
          phone is dead, the playlist is gone, and it's just you, the road,
          and whatever you were avoiding on Monday. That's the peace I cycle for.
          Definitely not for the kudos. <em>(Okay, also the kudos.)</em>
        </p>
        <div style={{ marginTop: 24 }}>
          <span className="me-chapter-stat"><b>100km+</b><span>Events done</span></span>
          <span className="me-chapter-stat"><b>N+1</b><span>Optimal bike count</span></span>
          <span className="me-chapter-stat"><b>0</b><span>Regrets · post-ride</span></span>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://www.strava.com/athletes/113238146" target="_blank" rel="noopener noreferrer">
            🚴 Follow on Strava
          </a>
        </div>
      </div>

      {/* Scene panel — perspective road */}
      <div className="me-scene-panel" aria-hidden="true">
        <div className="me-road">
          <div className="me-road-sun" />
          <div className="me-road-floor" />
          {/* Cyclist silhouette */}
          <svg
            viewBox="0 0 120 80"
            style={{
              position: 'absolute',
              bottom: '18%',
              left: '50%',
              width: '40%',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
            }}
          >
            <defs>
              <linearGradient id="bikerider" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1a1a2e" />
              </linearGradient>
            </defs>
            {/* Wheels */}
            <circle cx="25" cy="60" r="14" stroke="#fde047" strokeWidth="2" fill="none" />
            <circle cx="25" cy="60" r="2" fill="#fde047" />
            <circle cx="85" cy="60" r="14" stroke="#fde047" strokeWidth="2" fill="none" />
            <circle cx="85" cy="60" r="2" fill="#fde047" />
            {/* Frame */}
            <path d="M25 60 L55 60 L70 35 L85 60 M55 60 L60 30 L70 35 L50 20" stroke="#fde047" strokeWidth="2" fill="none" />
            {/* Rider */}
            <circle cx="50" cy="12" r="6" fill="url(#bikerider)" />
            <path d="M50 18 L52 30 L60 30 L55 45 L62 50 L70 35 M55 30 L40 22" stroke="url(#bikerider)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          {/* Stats badge */}
          <div style={{
            position: 'absolute',
            top: '8%',
            left: '8%',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,140,66,0.35)',
            fontSize: 12,
            fontWeight: 700,
            color: '#ff8c42',
            letterSpacing: '0.1em',
          }}>
            KM 87 / 100 · PB PACE
          </div>
        </div>
      </div>
    </section>
  );
}
