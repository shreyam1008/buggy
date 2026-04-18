import { useState } from 'react';

// Tiny "pick the different one" minigame — a joke-grade divergent-stimulus screener.
const puzzles = [
  { options: ['🟥', '🟥', '🟥', '🟧', '🟥'], odd: 3, label: 'Find the odd orange.' },
  { options: ['🟩', '🟩', '🟩', '🟩', '🍏'], odd: 4, label: 'Spot the non-square.' },
  { options: ['🔵', '🔵', '🔷', '🔵', '🔵'], odd: 2, label: 'Which circle isn\'t?' },
];

export default function ChapterMind() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const p = puzzles[puzzleIdx];
  const correct = picked !== null && picked === p.odd;

  const next = () => {
    setPuzzleIdx((i) => (i + 1) % puzzles.length);
    setPicked(null);
  };

  return (
    <section
      id="chapter-mind"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #b794f4 0%, #f472b6 50%, #60a5fa 100%)',
        ['--chapter-accent' as string]: '#c4b5fd',
      } as React.CSSProperties}
      aria-labelledby="chapter-mind-title"
    >
      <div>
        <div className="me-chapter-kicker">V · The Soft Science</div>
        <h2 id="chapter-mind-title" className="me-chapter-title">Mind<br />Lab</h2>
        <p className="me-chapter-lede">
          <strong>Student of psychology.</strong> Trained in{' '}
          <strong>suicide prevention</strong>, divergent-behaviour screening,
          and several other things that sound scarier on a CV than they
          feel in the room. Volunteered as a <strong>mental health awareness
          speaker</strong> across Nepali rural schools and government institutions.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          The interesting thing about code and the mind? They both crash silently
          and no stack trace makes it out. But one of them you <em>can</em> restart
          with a hug, so psychology is probably the higher-leverage career.
        </p>

        {/* Mini screener — purely for fun */}
        <div style={{
          marginTop: 20,
          padding: 18,
          borderRadius: 16,
          background: 'rgba(183,148,244,0.08)',
          border: '1px solid rgba(183,148,244,0.25)',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>
            Mini-screener™ (totally not clinically validated)
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{p.label}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {p.options.map((o, i) => (
              <button
                key={i}
                onClick={() => setPicked(i)}
                style={{
                  fontSize: 30,
                  width: 54,
                  height: 54,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 12,
                  border: picked === i
                    ? (correct ? '2px solid #4ade80' : '2px solid #f87171')
                    : '1px solid rgba(255,255,255,0.12)',
                  background: picked === i
                    ? (correct ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)')
                    : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {o}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, minHeight: 28 }}>
            {picked !== null && (
              <>
                <span style={{ fontSize: 13, opacity: 0.8 }}>
                  {correct ? '✔️ Diagnosis: probably fine.' : '✖️ Diagnosis: keep trying, eyes are hard.'}
                </span>
                <button onClick={next} className="me-cta me-cta-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Next →
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ fontSize: 12, opacity: 0.45, marginTop: 14, fontStyle: 'italic' }}>
          Not a substitute for real care. If you're struggling, please talk to a
          professional. The real screeners take longer than an emoji click.
        </p>
      </div>

      {/* Scene panel — synapse web */}
      <div className="me-scene-panel" aria-hidden="true">
        <svg viewBox="0 0 400 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="synapseCore">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b794f4" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Neural connection lines with pulses */}
          {[
            [80, 90, 200, 200], [320, 80, 200, 200], [60, 300, 200, 200],
            [340, 310, 200, 200], [200, 60, 200, 200], [200, 340, 200, 200],
            [120, 200, 200, 200], [280, 200, 200, 200],
          ].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(183,148,244,0.25)" strokeWidth="1" />
              <circle r="3" fill="#c4b5fd">
                <animateMotion
                  dur={`${3 + (i % 3)}s`}
                  repeatCount="indefinite"
                  path={`M${x1},${y1} L${x2},${y2}`}
                  begin={`${i * 0.4}s`}
                />
                <animate attributeName="opacity" values="0;1;0" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            </g>
          ))}
          {/* Core */}
          <circle cx="200" cy="200" r="60" fill="url(#synapseCore)" />
          <circle cx="200" cy="200" r="22" fill="#c4b5fd">
            <animate attributeName="r" values="22;28;22" dur="2.4s" repeatCount="indefinite" />
          </circle>
          {/* Peripheral neurons */}
          {[[80, 90], [320, 80], [60, 300], [340, 310], [200, 60], [200, 340], [120, 200], [280, 200]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="7" fill="#c4b5fd" opacity="0.7">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </circle>
          ))}
        </svg>
      </div>
    </section>
  );
}
