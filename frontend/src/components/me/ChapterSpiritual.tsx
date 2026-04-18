export default function ChapterSpiritual() {
  return (
    <section
      id="chapter-spiritual"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #f6c667 0%, #ff8c42 50%, #f472b6 100%)',
        ['--chapter-accent' as string]: '#f6c667',
      } as React.CSSProperties}
      aria-labelledby="chapter-spiritual-title"
    >
      <div>
        <div className="me-chapter-kicker">II · The Anchor</div>
        <h2 id="chapter-spiritual-title" className="me-chapter-title">Mandala<br />Heart</h2>
        <p className="me-chapter-lede">
          <strong>Sakhi of Radha.</strong> A disciple of{' '}
          <strong>Jagadguru Shree Kripalu Ji Maharaj</strong>. When the server
          is on fire and the logs are screaming, the bhajans still play. The
          flute always wins.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          I built <a href="https://radhey.web.app/" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--chapter-accent)', textDecoration: 'underline', textUnderlineOffset: 4 }}>Radhey</a> —
          a tiny offering on the web. Because if I'm going to spend 80% of my
          life in a terminal, the terminal should at least know{' '}
          <em>Radhey Radhey</em>.
        </p>
        <blockquote style={{
          margin: '24px 0',
          padding: '14px 20px',
          borderLeft: '3px solid var(--chapter-accent)',
          fontStyle: 'italic',
          fontSize: 17,
          opacity: 0.85,
          lineHeight: 1.55,
        }}>
          "राधे राधे" — two words that reboot the soul faster than any{' '}
          <code style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 13,
            fontStyle: 'normal',
          }}>sudo systemctl restart</code>.
        </blockquote>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://radhey.web.app/" target="_blank" rel="noopener noreferrer">
            🌸 Visit Radhey
          </a>
          <a
            className="me-cta me-cta-ghost"
            href="https://www.jkp.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            About My Guru →
          </a>
        </div>
      </div>

      {/* Scene panel — mandala rings */}
      <div className="me-scene-panel" aria-hidden="true">
        <div className="me-mandala">
          <div className="me-mandala-ring" style={{ width: '95%', height: '95%' }} />
          <div className="me-mandala-ring r2" style={{ width: '78%', height: '78%' }} />
          <div className="me-mandala-ring r3" style={{ width: '60%', height: '60%' }} />
          <div className="me-mandala-ring r4" style={{ width: '40%', height: '40%' }} />

          {/* Lotus center */}
          <svg viewBox="0 0 200 200" width="60%" height="60%" style={{ position: 'absolute', filter: 'drop-shadow(0 0 40px rgba(246,198,103,0.6))' }}>
            <defs>
              <radialGradient id="lotus-g">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#831843" />
              </radialGradient>
            </defs>
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={i}
                cx="100"
                cy="60"
                rx="18"
                ry="42"
                fill="url(#lotus-g)"
                opacity="0.85"
                transform={`rotate(${i * 45} 100 100)`}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={`inner-${i}`}
                cx="100"
                cy="75"
                rx="12"
                ry="28"
                fill="#fde68a"
                opacity="0.7"
                transform={`rotate(${i * 45 + 22.5} 100 100)`}
              />
            ))}
            <circle cx="100" cy="100" r="12" fill="#fbbf24" />
          </svg>

          {/* OM at center-top */}
          <div style={{
            position: 'absolute',
            top: '14%',
            fontSize: 'clamp(24px, 5vw, 44px)',
            color: 'var(--chapter-accent)',
            fontWeight: 300,
            opacity: 0.85,
            textShadow: '0 0 24px rgba(246,198,103,0.6)',
          }}>
            ॐ
          </div>
        </div>
      </div>
    </section>
  );
}
