import PhotoOrbit, { type OrbitPhoto } from './PhotoOrbit';

// Add entries here to make them orbit the chessboard + radar scene.
// Leave empty = signature scene stays hero.
const PHOTOS: OrbitPhoto[] = [];

export default function ChapterArena() {
  // 8x8 chessboard color pattern
  const chess = Array.from({ length: 64 }).map((_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return (row + col) % 2 === 0 ? '#2a2a33' : '#b3b3b8';
  });

  return (
    <section
      id="chapter-arena"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #00ff88 0%, #22d3ee 40%, #6cb4ee 70%, #b794f4 100%)',
        ['--chapter-accent' as string]: '#6ee7b7',
      } as React.CSSProperties}
      aria-labelledby="chapter-arena-title"
    >
      <div>
        <div className="me-chapter-kicker">VI · The Arena</div>
        <h2 id="chapter-arena-title" className="me-chapter-title">Pixel<br />Arena</h2>
        <p className="me-chapter-lede">
          <strong>Chess, but only on rails.</strong> Two openings, forever:{' '}
          <strong>London System</strong> with White,{' '}
          <strong>King's Indian</strong> with Black. I know — safe, boring,
          predictable. I also know I <em>don't lose out of the opening</em>,
          and that's a trade I'll keep making.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.8 }}>
          <strong>CS:GO peak: Gold Nova III.</strong> Played exactly one map —{' '}
          <code style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 13,
          }}>de_dust2</code>{' '}
          — and I played it until the pixels knew my name. Couldn't pick{' '}
          <em>Mirage</em> out of a lineup. Couldn't hit a shot on{' '}
          <em>Inferno</em>. Pure, committed, beautiful monogamy.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.8 }}>
          <strong>Rogue-lite nerd.</strong> Vampire Survivors, Brotato,
          Bloons TD 6, Slay the Spire-adjacent deck builders, whatever tower
          defence is hot on Steam that week. Give me stacking upgrades and
          exponential curves and I'll lose a Saturday to them without complaint.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.85 }}>
          <strong style={{ color: '#6cb4ee' }}>Manchester City until I die.</strong>{' '}
          Sky blue shirt on match day. I will defend every questionable
          midfield substitution. I will lose sleep over a dropped-points draw
          at Brentford. Football is the only tribalism I've made peace with —
          and City is mine.
        </p>

        <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="me-chapter-stat"><b>2</b><span>Chess openings total</span></span>
          <span className="me-chapter-stat"><b>1</b><span>CS map, ever</span></span>
          <span className="me-chapter-stat"><b>GN3</b><span>CS:GO peak</span></span>
          <span className="me-chapter-stat" style={{ ['--chapter-accent' as string]: '#6cb4ee' } as React.CSSProperties}>
            <b>MCFC</b><span>Sky blue · forever</span>
          </span>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://steamcommunity.com/id/buggythegret" target="_blank" rel="noopener noreferrer">
            🎮 Steam · buggythegret
          </a>
        </div>
      </div>

      {/* Scene panel — chessboard in the middle, photo orbit around it, radar + XP HUD overlays */}
      <div className="me-scene-panel">
        <PhotoOrbit photos={PHOTOS} radius={180} size={70} speed={36}>
          <div className="me-arena-grid" style={{ width: 280, height: 280 }}>
            <div className="me-chess">
              {chess.map((c, i) => (
                <div key={i} style={{ ['--c' as string]: c } as React.CSSProperties} />
              ))}
            </div>
            {/* Tiny MCFC crest below the board */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(10, 40, 80, 0.7)',
                border: '1px solid rgba(108, 180, 238, 0.5)',
                backdropFilter: 'blur(6px)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#6cb4ee',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff, #6cb4ee 40%, #0a4a8f 90%)',
                boxShadow: '0 0 8px rgba(108,180,238,0.8)',
              }} />
              MCFC · 1894
            </div>
          </div>
        </PhotoOrbit>

        {/* Radar HUD overlay — stays top-right, outside the orbit */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 110,
            height: 110,
            borderRadius: '50%',
            border: '2px solid rgba(0,255,136,0.5)',
            background: 'radial-gradient(circle, rgba(0,255,136,0.15), transparent 70%)',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, transparent 49%, rgba(0,255,136,0.6) 50%, transparent 51%), linear-gradient(90deg, transparent 49%, rgba(0,255,136,0.6) 50%, transparent 51%)',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 56,
            height: 56,
            marginTop: -28,
            marginLeft: -28,
            borderRadius: '50%',
            border: '1px solid rgba(0,255,136,0.4)',
            background: 'conic-gradient(from 0deg, rgba(0,255,136,0.5), transparent 30%)',
            animation: 'me-spin 2.5s linear infinite',
          }} />
          <div style={{ position: 'absolute', top: 32, left: 26, width: 6, height: 6, borderRadius: '50%', background: '#ff4444' }} />
          <div style={{ position: 'absolute', top: 64, left: 70, width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7' }} />
          <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.1em' }}>
            DUST II
          </div>
        </div>
      </div>
    </section>
  );
}
