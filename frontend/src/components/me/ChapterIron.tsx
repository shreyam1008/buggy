export default function ChapterIron() {
  return (
    <section
      id="chapter-iron"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #ff4444 0%, #fb7185 50%, #f97316 100%)',
        ['--chapter-accent' as string]: '#fb7185',
      } as React.CSSProperties}
      aria-labelledby="chapter-iron-title"
    >
      <div>
        <div className="me-chapter-kicker">IV · The Forge</div>
        <h2 id="chapter-iron-title" className="me-chapter-title">Iron<br />Forge</h2>
        <p className="me-chapter-lede">
          <strong>Gym enthusiast.</strong> Trained roughly 5 people into better
          versions of themselves. Sample size is statistically insignificant,
          methodology is 100% vibes — but all 5 are still lifting, so we're
          calling that a <strong>100% adherence rate</strong> and publishing
          the paper.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          My philosophy: the bar doesn't care about your excuses, your
          deadline, your PR review, or your mood. It just wants to go up.
          Sometimes I envy its clarity.
        </p>
        <div style={{ marginTop: 24 }}>
          <span className="me-chapter-stat"><b>5</b><span>Humans trained</span></span>
          <span className="me-chapter-stat"><b>5/5</b><span>Still lifting</span></span>
          <span className="me-chapter-stat"><b>p &lt; 1</b><span>Very significant, trust me</span></span>
        </div>
        <p style={{ fontSize: 13, opacity: 0.5, marginTop: 18, fontStyle: 'italic' }}>
          (Disclaimer: I am not a certified trainer. I am a certified enthusiast.
          Consult an actual professional before you do anything I say.)
        </p>
      </div>

      {/* Scene panel — floating dumbbell */}
      <div className="me-scene-panel" aria-hidden="true">
        <div className="me-iron-bell">
          <svg viewBox="0 0 240 120" width="90%">
            <defs>
              <linearGradient id="bell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a4a55" />
                <stop offset="50%" stopColor="#2a2a35" />
                <stop offset="100%" stopColor="#0a0a10" />
              </linearGradient>
              <linearGradient id="bellHi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Left plate */}
            <rect x="10" y="20" width="30" height="80" rx="6" fill="url(#bell)" />
            <rect x="14" y="22" width="6" height="40" rx="2" fill="url(#bellHi)" />
            <rect x="40" y="40" width="20" height="40" rx="4" fill="url(#bell)" />
            <rect x="42" y="42" width="4" height="20" rx="1" fill="url(#bellHi)" />
            {/* Bar */}
            <rect x="60" y="52" width="120" height="16" rx="4" fill="#6b7280" />
            <rect x="65" y="54" width="110" height="2" rx="1" fill="#fff" opacity="0.3" />
            {/* Right plate */}
            <rect x="180" y="40" width="20" height="40" rx="4" fill="url(#bell)" />
            <rect x="182" y="42" width="4" height="20" rx="1" fill="url(#bellHi)" />
            <rect x="200" y="20" width="30" height="80" rx="6" fill="url(#bell)" />
            <rect x="204" y="22" width="6" height="40" rx="2" fill="url(#bellHi)" />
            {/* Weight labels */}
            <text x="25" y="68" fill="#fff" opacity="0.6" fontSize="11" fontWeight="900" textAnchor="middle">20</text>
            <text x="215" y="68" fill="#fff" opacity="0.6" fontSize="11" fontWeight="900" textAnchor="middle">20</text>
          </svg>
        </div>
        {/* Sweat drops */}
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 400 400" preserveAspectRatio="none">
          <circle cx="80" cy="80" r="3" fill="#60a5fa" opacity="0.7">
            <animate attributeName="cy" values="80;380;80" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="320" cy="120" r="4" fill="#60a5fa" opacity="0.7">
            <animate attributeName="cy" values="120;380;120" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="60" r="3" fill="#60a5fa" opacity="0.7">
            <animate attributeName="cy" values="60;380;60" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </section>
  );
}
