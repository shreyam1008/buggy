/**
 * WalkingSprite — Radha and Krishna as two circular painted portraits walking
 * together across the bottom of the viewport. Uses the hand-painted SVGs
 * shipped at /me/radha.svg and /me/krishna.svg — these already contain the
 * full iconography (peacock feather crown, flute, sari, jewellery) so we
 * simply present them as glowing circular avatars.
 *
 * Design:
 *  - Two gold-rimmed circular portraits, bobbing out of phase
 *  - Subtle golden aura behind them
 *  - Floating golden/pink petals (ambient bhakti dust)
 *  - Soft ground shadow
 *  - Respects prefers-reduced-motion (fall-back in me.css)
 */
export default function WalkingSprite() {
  return (
    <div className="me-sprite" aria-hidden="true">
      <div className="me-sprite-bob">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 8,
            paddingBottom: 6,
          }}
        >
          {/* Soft golden aura behind both */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 24,
              width: 180,
              height: 90,
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at center, rgba(253, 230, 138, 0.35), rgba(253, 230, 138, 0) 70%)',
              pointerEvents: 'none',
              filter: 'blur(4px)',
            }}
          />

          <div className="me-avatar me-avatar-radha" title="Radha">
            <img
              src="/me/radha.svg"
              alt=""
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>

          <div className="me-avatar me-avatar-krishna" title="Krishna">
            <img
              src="/me/krishna.svg"
              alt=""
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>

          {/* Ground shadow */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '18%',
              right: '18%',
              height: 8,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />

          {/* Gold bhakti dust (SVG animations = respects reduce-motion via @media) */}
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            viewBox="0 0 220 140"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <circle cx="40" cy="40" r="1.4" fill="#fde047" opacity="0.7">
              <animate attributeName="cy" values="40;110;40" dur="7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="7s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy="20" r="1.6" fill="#f472b6" opacity="0.7">
              <animate attributeName="cy" values="20;110;20" dur="9s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="9s" repeatCount="indefinite" />
            </circle>
            <circle cx="110" cy="10" r="1.2" fill="#fbbf24" opacity="0.8">
              <animate attributeName="cy" values="10;100;10" dur="11s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="11s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="6" r="1.1" fill="#f59e0b" opacity="0.7">
              <animate attributeName="cy" values="6;100;6" dur="13s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="13s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
}
