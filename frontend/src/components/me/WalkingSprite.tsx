/**
 * WalkingSprite — a hand-crafted SVG silhouette of Radha-Krishna walking
 * gently across the viewport. Pure SVG + CSS animation. No libs.
 *
 * Iconography honoured:
 *  - Krishna: peacock feather (morpankh), flute (bansuri), yellow pitambara,
 *             dark blue-black skin tone.
 *  - Radha:   flowing pink sari, hand-to-heart mudra, crown of flowers.
 */
export default function WalkingSprite() {
  return (
    <div className="me-sprite" aria-hidden="true">
      <div className="me-sprite-bob">
        <svg
          viewBox="0 0 220 140"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Krishna skin — dark blue */}
            <linearGradient id="sk-krishna" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6096d6" />
              <stop offset="100%" stopColor="#2a4a7a" />
            </linearGradient>
            {/* Radha skin — warm fair */}
            <linearGradient id="sk-radha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde1c8" />
              <stop offset="100%" stopColor="#e8b896" />
            </linearGradient>
            {/* Krishna's yellow dhoti */}
            <linearGradient id="dhoti" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            {/* Radha's pink sari */}
            <linearGradient id="sari" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f9a8d4" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
            {/* Peacock feather */}
            <radialGradient id="feather" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#14b8a6" />
              <stop offset="70%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#172554" />
            </radialGradient>
            {/* Ground shadow */}
            <radialGradient id="shadow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* Gentle leg walk for Krishna */}
            <style>{`
              .leg-k-f { transform-origin: 148px 95px; animation: legwalk 1.1s ease-in-out infinite; }
              .leg-k-b { transform-origin: 148px 95px; animation: legwalk 1.1s ease-in-out infinite reverse; }
              .leg-r-f { transform-origin: 72px 95px;  animation: legwalk 1.1s ease-in-out infinite 0.15s; }
              .leg-r-b { transform-origin: 72px 95px;  animation: legwalk 1.1s ease-in-out infinite reverse 0.15s; }
              .arm-k   { transform-origin: 148px 78px; animation: armswing 1.1s ease-in-out infinite; }
              .arm-r   { transform-origin: 72px 78px;  animation: armswing 1.1s ease-in-out infinite reverse; }
              .feather-sway { transform-origin: 148px 42px; animation: sway 3s ease-in-out infinite; }
              @keyframes legwalk { 0%,100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
              @keyframes armswing { 0%,100% { transform: rotate(8deg); } 50% { transform: rotate(-8deg); } }
              @keyframes sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(6deg); } }
              @media (prefers-reduced-motion: reduce) {
                .leg-k-f, .leg-k-b, .leg-r-f, .leg-r-b, .arm-k, .arm-r, .feather-sway { animation: none; }
              }
            `}</style>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="110" cy="128" rx="80" ry="6" fill="url(#shadow)" />

          {/* -------------------- RADHA (left) -------------------- */}
          {/* Back leg */}
          <g className="leg-r-b">
            <rect x="68" y="95" width="7" height="28" rx="3" fill="url(#sari)" />
            <ellipse cx="71.5" cy="124" rx="5" ry="2" fill="#4a1a2a" />
          </g>
          {/* Sari body */}
          <path
            d="M55 65 Q55 55 72 55 Q89 55 89 65 L92 100 Q90 110 72 110 Q54 110 52 100 Z"
            fill="url(#sari)"
          />
          {/* Sari pleats */}
          <path d="M60 70 Q72 72 84 70 L88 96 Q72 100 56 96 Z" fill="rgba(255,255,255,0.08)" />
          {/* Front leg */}
          <g className="leg-r-f">
            <rect x="70" y="95" width="7" height="28" rx="3" fill="url(#sari)" opacity="0.95" />
            <ellipse cx="73.5" cy="124" rx="5" ry="2" fill="#4a1a2a" />
          </g>
          {/* Arm hand-to-heart */}
          <g className="arm-r">
            <path
              d="M68 72 Q60 80 66 90 L72 88 Q70 82 74 76 Z"
              fill="url(#sk-radha)"
            />
          </g>
          {/* Back arm */}
          <path d="M78 72 Q86 78 84 92 L80 92 Q82 80 78 76 Z" fill="url(#sk-radha)" opacity="0.85" />
          {/* Neck */}
          <rect x="69" y="48" width="6" height="10" fill="url(#sk-radha)" />
          {/* Head */}
          <circle cx="72" cy="42" r="10" fill="url(#sk-radha)" />
          {/* Bun (hair) */}
          <circle cx="72" cy="33" r="7" fill="#2a0e14" />
          {/* Flower crown */}
          <circle cx="66" cy="30" r="2" fill="#fbbf24" />
          <circle cx="72" cy="27" r="2.2" fill="#f472b6" />
          <circle cx="78" cy="30" r="2" fill="#fbbf24" />
          {/* Bindi */}
          <circle cx="72" cy="41" r="1" fill="#dc2626" />
          {/* Earrings */}
          <circle cx="63" cy="44" r="1.2" fill="#fbbf24" />
          <circle cx="81" cy="44" r="1.2" fill="#fbbf24" />

          {/* -------------------- KRISHNA (right) -------------------- */}
          {/* Back leg */}
          <g className="leg-k-b">
            <rect x="144" y="95" width="7" height="28" rx="3" fill="url(#dhoti)" />
            <ellipse cx="147.5" cy="124" rx="5" ry="2" fill="#3a2a00" />
          </g>
          {/* Dhoti body */}
          <path
            d="M131 65 Q131 55 148 55 Q165 55 165 65 L168 102 Q148 112 128 102 Z"
            fill="url(#dhoti)"
          />
          {/* Dhoti wrap lines */}
          <path
            d="M131 82 Q148 86 165 82 L166 92 Q148 96 130 92 Z"
            fill="rgba(255,255,255,0.2)"
          />
          {/* Front leg */}
          <g className="leg-k-f">
            <rect x="146" y="95" width="7" height="28" rx="3" fill="url(#dhoti)" opacity="0.95" />
            <ellipse cx="149.5" cy="124" rx="5" ry="2" fill="#3a2a00" />
          </g>
          {/* Back arm */}
          <g className="arm-k">
            <path d="M155 72 Q162 80 160 92 L156 92 Q158 82 154 76 Z" fill="url(#sk-krishna)" opacity="0.9" />
          </g>
          {/* Front arm holding flute */}
          <path d="M144 70 Q134 75 130 68 L126 60 Q124 52 118 52 Q116 52 116 54 Q118 56 122 58 L128 72 Q134 80 144 78 Z" fill="url(#sk-krishna)" />
          {/* Flute (bansuri) */}
          <rect x="105" y="53" width="20" height="3" rx="1.5" fill="#8b4513" />
          <circle cx="111" cy="54.5" r="0.7" fill="#2a0f00" />
          <circle cx="115" cy="54.5" r="0.7" fill="#2a0f00" />
          <circle cx="119" cy="54.5" r="0.7" fill="#2a0f00" />
          {/* Neck */}
          <rect x="145" y="48" width="6" height="10" fill="url(#sk-krishna)" />
          {/* Head */}
          <circle cx="148" cy="42" r="10" fill="url(#sk-krishna)" />
          {/* Smile */}
          <path d="M145 45 Q148 47 151 45" stroke="#1a2f4f" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          {/* Eye dots */}
          <circle cx="145" cy="41" r="0.8" fill="#0a1a2f" />
          <circle cx="151" cy="41" r="0.8" fill="#0a1a2f" />
          {/* Hair base */}
          <path d="M140 36 Q148 28 156 36 L156 42 Q148 38 140 42 Z" fill="#0a0a1a" />
          {/* Mukut (crown base) */}
          <rect x="141" y="33" width="14" height="3" rx="1" fill="#fbbf24" />
          {/* Peacock feather on crown */}
          <g className="feather-sway">
            <path
              d="M148 33 Q144 24 140 14 Q144 10 148 14 Q152 10 156 14 Q152 24 148 33 Z"
              fill="url(#feather)"
            />
            {/* Feather eye */}
            <ellipse cx="148" cy="18" rx="2.5" ry="3.5" fill="#1e40af" />
            <ellipse cx="148" cy="18" rx="1.2" ry="2" fill="#f59e0b" />
            <circle cx="148" cy="18" r="0.6" fill="#000" />
          </g>

          {/* Holding hands between them (subtle line) */}
          <path d="M82 88 Q110 94 138 88" stroke="url(#sari)" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />

          {/* Tiny flower petals floating */}
          <circle cx="40" cy="30" r="1.5" fill="#f472b6" opacity="0.7">
            <animate attributeName="cy" values="30;110;30" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="180" cy="20" r="1.5" fill="#fbbf24" opacity="0.7">
            <animate attributeName="cy" values="20;100;20" dur="10s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="10s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="8" r="1.2" fill="#fde047" opacity="0.7">
            <animate attributeName="cy" values="8;100;8" dur="11s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="11s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
}
