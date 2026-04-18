interface Social {
  name: string;
  handle: string;
  href: string;
  color: string;
  icon: string;
  description: string;
}

const SOCIALS: Social[] = [
  { name: 'GitHub',    handle: '@shreyam1008',   href: 'https://github.com/shreyam1008',              color: '#f0f6fc', icon: '🐙', description: 'where the code lives' },
  { name: 'LinkedIn',  handle: 'shreyam1008',    href: 'https://www.linkedin.com/in/shreyam1008/',    color: '#0a66c2', icon: '💼', description: 'the formal-dress-up one' },
  { name: 'X / Twitter', handle: '@shreyam1008', href: 'https://x.com/shreyam1008',                   color: '#1d9bf0', icon: '🐦', description: 'hot takes at 3 am' },
  { name: 'Instagram', handle: '@shreyam1008',   href: 'https://instagram.com/shreyam1008',           color: '#e4405f', icon: '📸', description: 'gym pics, rarely' },
  { name: 'Facebook',  handle: 'shreyam1008',    href: 'https://www.facebook.com/shreyam1008',        color: '#1877f2', icon: '📘', description: 'legacy mode · still on' },
  { name: 'Strava',    handle: '113238146',      href: 'https://www.strava.com/athletes/113238146',   color: '#fc4c02', icon: '🚴', description: 'watch me suffer in real-time' },
  { name: 'Steam',     handle: 'buggythegret',   href: 'https://steamcommunity.com/id/buggythegret',  color: '#5865f2', icon: '🎮', description: 'peak gaming identity' },
  { name: 'YouTube',   handle: '@shreyam1008',   href: 'https://youtube.com/@shreyam1008',            color: '#ff0000', icon: '📺', description: 'occasional tech videos' },
  { name: 'Website',   handle: 'shreyam1008.com.np', href: 'https://shreyam1008.com.np/',              color: '#fde68a', icon: '🌐', description: 'the one true source' },
  { name: 'Email',     handle: 'shreyam1008@gmail.com', href: 'mailto:shreyam1008@gmail.com',         color: '#fbbf24', icon: '✉️', description: 'for grown-up conversations' },
];

export default function ChapterCluster() {
  return (
    <section
      id="chapter-cluster"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #f5b7d5 0%, #f472b6 50%, #fde68a 100%)',
        ['--chapter-accent' as string]: '#f5b7d5',
        gridTemplateColumns: '1fr',
      } as React.CSSProperties}
      aria-labelledby="chapter-cluster-title"
    >
      <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div className="me-chapter-kicker">VII · The Constellation</div>
        <h2 id="chapter-cluster-title" className="me-chapter-title" style={{ margin: '0 auto 16px' }}>
          Same<br />Handle.<br />Everywhere.
        </h2>
        <p className="me-chapter-lede" style={{ margin: '0 auto 12px' }}>
          One username across <strong>every platform that matters</strong>.
          If it says <strong>shreyam1008</strong> or <strong>buggythegret</strong>,
          it's me. If it's a bot, please stop DMing. If it's a recruiter —
          hi, <em>let's talk</em>.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.6, margin: '0 auto 28px', fontSize: 14 }}>
          Verified: these are the official profiles of Shreyam Adhikari. Anything
          else claiming the name is either impersonation or my parallel-universe twin.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          textAlign: 'left',
        }}>
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              itemProp="sameAs"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = s.color;
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                boxShadow: `0 8px 20px ${s.color}40`,
                flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, opacity: 0.65, fontFamily: 'ui-monospace, monospace' }}>{s.handle}</div>
                <div style={{ fontSize: 11, opacity: 0.45, marginTop: 2 }}>{s.description}</div>
              </div>
              <div style={{ opacity: 0.3, fontSize: 20 }} aria-hidden="true">↗</div>
            </a>
          ))}
        </div>

        <div style={{
          marginTop: 48,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(245,183,213,0.08), rgba(183,148,244,0.08))',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>
            TL;DR
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
            I write code. I ride bikes. I lift things. I read minds (professionally, sort of).
            I lose at chess. I bow to Krishna. I ship. <strong>Everything else is commentary.</strong>
          </p>
          <p style={{ fontSize: 13, opacity: 0.5, marginTop: 16 }}>
            — Shreyam Adhikari · <code>shreyam1008</code> · <code>buggythegret</code>
          </p>
        </div>
      </div>
    </section>
  );
}
