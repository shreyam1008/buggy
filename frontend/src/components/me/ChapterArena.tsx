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
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #00ff88 0%, #22d3ee 50%, #b794f4 100%)',
        ['--chapter-accent' as string]: '#6ee7b7',
      } as React.CSSProperties}
      aria-labelledby="chapter-arena-title"
    >
      <div>
        <div className="me-chapter-kicker">VI · The Arena</div>
        <h2 id="chapter-arena-title" className="me-chapter-title">Pixel<br />Arena</h2>
        <p className="me-chapter-lede">
          <strong>Gamer.</strong> Reached <strong>Gold Nova III</strong> in CS:GO
          playing literally only <code style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 13,
          }}>de_dust2</code>. Know every corner, boost, smoke, and
          molly timing on that map. Other maps? Never met them.
          Couldn't pick <em>Mirage</em> out of a lineup.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          <strong>Bad at chess.</strong> Lose to the same tactic three games in a
          row, then win with it on game four and call it strategy.
          Rogue-lite addict — <strong>Vampire Survivors</strong>,{' '}
          <strong>Brotato</strong>, tower defence marathons on{' '}
          <strong>Bloons TD 6</strong>. Give me stacking upgrades and I lose
          a weekend.
        </p>

        <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="me-chapter-stat"><b>GN3</b><span>CS:GO peak</span></span>
          <span className="me-chapter-stat"><b>1</b><span>Map played</span></span>
          <span className="me-chapter-stat"><b>∞</b><span>Brotato runs</span></span>
          <span className="me-chapter-stat"><b>400</b><span>Elo · chess.com (generous)</span></span>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://steamcommunity.com/id/buggythegret" target="_blank" rel="noopener noreferrer">
            🎮 Steam · buggythegret
          </a>
        </div>
      </div>

      {/* Scene panel — 3D chessboard + CS callout radar feel */}
      <div className="me-scene-panel" aria-hidden="true">
        <div className="me-arena-grid">
          <div className="me-chess">
            {chess.map((c, i) => <div key={i} style={{ ['--c' as string]: c } as React.CSSProperties} />)}
          </div>
        </div>

        {/* Radar HUD overlay */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '2px solid rgba(0,255,136,0.5)',
          background: 'radial-gradient(circle, rgba(0,255,136,0.15), transparent 70%)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, transparent 49%, rgba(0,255,136,0.6) 50%, transparent 51%), linear-gradient(90deg, transparent 49%, rgba(0,255,136,0.6) 50%, transparent 51%)',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 60,
            height: 60,
            marginTop: -30,
            marginLeft: -30,
            borderRadius: '50%',
            border: '1px solid rgba(0,255,136,0.4)',
            background: 'conic-gradient(from 0deg, rgba(0,255,136,0.5), transparent 30%)',
            animation: 'me-spin 2.5s linear infinite',
          }} />
          <div style={{ position: 'absolute', top: 35, left: 28, width: 6, height: 6, borderRadius: '50%', background: '#ff4444' }} />
          <div style={{ position: 'absolute', top: 70, left: 78, width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7' }} />
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.1em' }}>
            DUST II
          </div>
        </div>

        {/* Vampire-survivors xp bar for fun */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 12,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        }}>
          <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>LVL 42 · XP</div>
          <div style={{
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              width: '72%',
              height: '100%',
              background: 'linear-gradient(90deg, #6ee7b7, #22d3ee)',
              boxShadow: '0 0 12px rgba(110,231,183,0.6)',
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}
