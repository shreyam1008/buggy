/**
 * BackgroundFlute — A whisper-quiet, self-drawing bansuri (bamboo flute) that
 * sits far in the background of the /me page.
 *
 * Design principles:
 *  - Zero JS beyond this 40-line component (pure SVG + CSS animation).
 *  - Uses `stroke-dasharray` + `stroke-dashoffset` so the flute outline draws
 *    itself over ~45s, rests, un-draws, and loops. One slow cycle ≈ 90s.
 *  - `pathLength="100"` normalises the math so the stroke math is predictable.
 *  - Opacity sits around 0.06 — most visitors won't consciously register it,
 *    which is the point. A Krishna reference for those who look twice.
 *  - Position is fixed to the viewport but tucked into the top-right well
 *    away from the main reading column.
 *  - `prefers-reduced-motion` kills the animation and keeps the flute drawn.
 */
export default function BackgroundFlute() {
  return (
    <svg
      className="me-bg-flute"
      viewBox="0 0 280 48"
      aria-hidden="true"
      focusable="false"
    >
      {/* Flute body — a capsule outline traced by the animated stroke */}
      <path
        className="me-bg-flute-body"
        d="M 12 14 H 262 Q 274 14 274 24 Q 274 34 262 34 H 12 Q 2 34 2 24 Q 2 14 12 14 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        pathLength={100}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Finger holes appear one by one as the stroke passes them */}
      <circle className="me-bg-flute-hole" style={{ animationDelay: '14s' }}  cx="50"  cy="24" r="2" fill="currentColor" />
      <circle className="me-bg-flute-hole" style={{ animationDelay: '18s' }}  cx="82"  cy="24" r="2" fill="currentColor" />
      <circle className="me-bg-flute-hole" style={{ animationDelay: '22s' }}  cx="114" cy="24" r="2" fill="currentColor" />
      <circle className="me-bg-flute-hole" style={{ animationDelay: '26s' }}  cx="146" cy="24" r="2" fill="currentColor" />
      <circle className="me-bg-flute-hole" style={{ animationDelay: '30s' }}  cx="178" cy="24" r="2" fill="currentColor" />
      <circle className="me-bg-flute-hole" style={{ animationDelay: '34s' }}  cx="210" cy="24" r="2" fill="currentColor" />

      {/* Mouth hole — slightly larger, appears first */}
      <circle className="me-bg-flute-hole" style={{ animationDelay: '8s'  }}  cx="238" cy="24" r="2.6" fill="currentColor" />

      {/* Three floating notes drift up on the same clock */}
      <g className="me-bg-flute-notes" aria-hidden="true">
        <text x="234" y="8"  fontSize="7" fill="currentColor" style={{ animationDelay: '12s' }}>♪</text>
        <text x="246" y="2"  fontSize="6" fill="currentColor" style={{ animationDelay: '24s' }}>♫</text>
        <text x="228" y="5"  fontSize="5" fill="currentColor" style={{ animationDelay: '36s' }}>♩</text>
      </g>
    </svg>
  );
}
