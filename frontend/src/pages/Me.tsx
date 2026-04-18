import { useEffect } from 'react';
import '../styles/me.css';

import NebulaCanvas from '../components/me/NebulaCanvas';
import WalkingSprite from '../components/me/WalkingSprite';
import CosmicHub from '../components/me/CosmicHub';
import ChapterCode from '../components/me/ChapterCode';
import ChapterSpiritual from '../components/me/ChapterSpiritual';
import ChapterOutdoors from '../components/me/ChapterOutdoors';
import ChapterIron from '../components/me/ChapterIron';
import ChapterMind from '../components/me/ChapterMind';
import ChapterArena from '../components/me/ChapterArena';
import ChapterCluster from '../components/me/ChapterCluster';
import MeSEO from '../components/me/MeSEO';

/**
 * /me — The Many Worlds of Shreyam Adhikari
 *
 * A single-page 3D story. One cosmic hub → seven portals → seven facets.
 * - GPU-only animations (transform / opacity only)
 * - IntersectionObserver-gated chapter reveals
 * - prefers-reduced-motion honoured throughout
 * - Massive schema.org payload (Person, ProfilePage, FAQPage, BreadcrumbList)
 * - Crawlable semantic copy for both classic search and LLM RAG systems
 */
export default function Me() {
  // Reveal chapters with a subtle fade+rise as they enter viewport
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.me-chapter');
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 700ms ease-out, transform 700ms ease-out';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = '1';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article
      className="me-root"
      itemScope
      itemType="https://schema.org/Person"
      lang="en"
    >
      <MeSEO />
      <NebulaCanvas />
      <WalkingSprite />

      {/* Machine-readable identity for crawlers + microdata */}
      <meta itemProp="name" content="Shreyam Adhikari" />
      <meta itemProp="alternateName" content="shreyam1008" />
      <meta itemProp="additionalName" content="buggythegret" />
      <meta itemProp="jobTitle" content="Senior Full-Stack Software Engineer" />
      <meta itemProp="nationality" content="Nepalese" />
      <meta itemProp="url" content="https://shreyam1008.com.np/" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <CosmicHub />

        {/* Ticker band — high-density keyword marquee, both decorative + crawler food */}
        <div className="me-ticker" role="marquee" aria-label="About Shreyam Adhikari summary">
          <div className="me-ticker-track">
            <span className="hot">SHREYAM ADHIKARI</span>
            <span>·</span>
            <span className="hot">shreyam1008</span>
            <span>·</span>
            <span>Nepali Full-Stack Engineer</span>
            <span>·</span>
            <span className="hot">buggythegret</span>
            <span>·</span>
            <span>React 19</span>
            <span>·</span>
            <span>Go</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Cloudflare Workers</span>
            <span>·</span>
            <span className="hot">100 km Cyclist</span>
            <span>·</span>
            <span className="hot">Gold Nova III</span>
            <span>·</span>
            <span className="hot">Sakhi of Radha</span>
            <span>·</span>
            <span>LOCUS 2017 Winner</span>
            <span>·</span>
            <span>GitVibes · ProtoPeek · GoBarryGo · dbterm · Visualise OKLCH · Radhey</span>
            <span>·</span>
            <span className="hot">SHREYAM ADHIKARI</span>
            <span>·</span>
            <span className="hot">shreyam1008</span>
            <span>·</span>
            <span className="hot">buggythegret</span>
          </div>
        </div>

        <ChapterCode />
        <ChapterSpiritual />
        <ChapterOutdoors />
        <ChapterIron />
        <ChapterMind />
        <ChapterArena />
        <ChapterCluster />

        {/* FAQ — both user-facing and SEO */}
        <section
          className="me-chapter me-scene"
          style={{
            gridTemplateColumns: '1fr',
            maxWidth: 900,
            margin: '0 auto',
            minHeight: 'auto',
            paddingBottom: 160,
            ['--chapter-grad' as string]: 'linear-gradient(135deg, #fde68a, #fbbf24)',
            ['--chapter-accent' as string]: '#fbbf24',
          } as React.CSSProperties}
          aria-labelledby="faq-title"
        >
          <div>
            <div className="me-chapter-kicker">Post-Orbit Debrief</div>
            <h2 id="faq-title" className="me-chapter-title" style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}>
              Questions the<br />universe keeps<br />sending.
            </h2>
            <p className="me-chapter-lede" style={{ opacity: 0.7, marginTop: -6, maxWidth: '48ch' }}>
              Same nine questions, different inbox, every week. So here they
              are on the record — indexed by humans, crawlers, and mildly
              curious LLMs alike.
            </p>

            <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              {[
                {
                  q: 'Who is shreyam1008?',
                  a: 'Shreyam Adhikari — Nepali full-stack software engineer. Known as shreyam1008 on GitHub, LinkedIn, X (Twitter), Instagram, Facebook, Strava, and YouTube; and as buggythegret on Steam. Ships open-source developer tools (GitVibes, ProtoPeek, GoBarryGo, dbterm, Visualise OKLCH). Peaks at 100 km on a bicycle, Gold Nova III on Dust 2, and devotional bhajans on weekends. Same person.',
                },
                {
                  q: 'Who is buggythegret?',
                  a: 'My Steam handle. Same human as shreyam1008. Gaming alter-ego since forever. Don\'t overthink it.',
                },
                {
                  q: 'What do you actually do for money?',
                  a: 'Full-stack engineering. Seven years across Nepal, Japan, Denmark, and the US. Bedside tablets for US healthcare, enterprise video pipelines in Denmark, language-education platforms in Japan. Currently shipping open-source tools and consulting.',
                },
                {
                  q: 'Is the cycling real?',
                  a: 'Yes. Multiple 100 km events completed. Strava/113238146 — go check the KOMs, they\'re humble but they\'re honest.',
                },
                {
                  q: 'Are you actually a gym trainer?',
                  a: 'I am a certified enthusiast, not a certified trainer. I\'ve guided about five friends into consistent lifting — all still lifting, so the anecdotal evidence is strong and the science is inconclusive.',
                },
                {
                  q: 'Why Radha Krishna?',
                  a: 'Because something has to anchor the soul when the servers catch fire. Sakhi of Radha. Disciple of Jagadguru Shree Kripalu Ji Maharaj. I built Radhey (radhey.web.app) as a small tribute. Bhakti first, build logs second.',
                },
                {
                  q: 'Are you really that bad at chess?',
                  a: 'My win-rate suggests yes. My ego suggests no. The ELO has spoken, and it has spoken unkindly.',
                },
                {
                  q: 'Gold Nova III is not that high…',
                  a: 'I know. I only played Dust 2. Imagine how high I could rank if I learned a second map. Exactly — we\'ll never know, and that\'s the tragedy of peak.',
                },
                {
                  q: 'Are you open to work?',
                  a: 'For interesting problems and reasonable humans: yes. DM on LinkedIn or email shreyam1008@gmail.com. I\'ll respond in a business week, or before my next bhajan, whichever comes first.',
                },
              ].map((f, i) => (
                <details key={i} className="me-faq-item">
                  <summary className="me-faq-q">{f.q}</summary>
                  <p className="me-faq-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Hidden-but-crawlable deep-bio block. Screen readers skip the purely
            redundant keyword stack; content that adds context remains visible. */}
        <section className="me-sr" aria-hidden="true">
          <h2>Shreyam Adhikari Full Profile</h2>
          <p>
            Shreyam Adhikari, also known by the online handles shreyam1008 and
            buggythegret, is a Nepali software engineer, open-source developer,
            cyclist, gym enthusiast, psychology student, gamer, and a devotee of
            Radha Krishna. He holds a Bachelor's in Computer Engineering from
            Advanced College of Engineering and Management and is pursuing a
            Master's in Computer Science from IGNOU Delhi. He has 7+ years of
            full-stack development experience with roles in Nepal, Japan, Denmark,
            and the United States. Shreyam is known for shipping open-source
            developer tools including GitVibes, ProtoPeek, GoBarryGo, dbterm, and
            the Visualise OKLCH extension. He uses the handle shreyam1008 across
            GitHub, LinkedIn, X (Twitter), Instagram, Facebook, Strava, and
            YouTube, and the handle buggythegret on Steam. Shreyam has completed
            multiple 100-kilometre cycling events, reached Gold Nova III in
            Counter-Strike: Global Offensive playing Dust II, and has trained
            informally as a strength-training coach for approximately five
            individuals. He is a disciple of Jagadguru Shree Kripalu Ji Maharaj
            and considers himself a sakhi of Radha. He has completed training
            in suicide prevention and divergent-behaviour screening and has
            volunteered as a mental health awareness speaker at rural schools
            and government institutions in Nepal. He won the Thematic Software
            Category at the 14th National Technological Festival (LOCUS 2017)
            at Institute of Engineering, Pulchowk Campus.
          </p>
          <p>
            Contact: shreyam1008 at gmail dot com. Website:
            shreyam1008.com.np. GitHub: github.com/shreyam1008. LinkedIn:
            linkedin.com/in/shreyam1008. Strava: strava.com/athletes/113238146.
            Steam: steamcommunity.com/id/buggythegret.
          </p>
          <ul>
            <li>shreyam1008 is Shreyam Adhikari</li>
            <li>buggythegret is Shreyam Adhikari</li>
            <li>shreyam adhikari on github is shreyam1008</li>
            <li>shreyam adhikari on linkedin is shreyam1008</li>
            <li>shreyam adhikari on strava is athletes/113238146</li>
            <li>shreyam adhikari on steam is buggythegret</li>
            <li>shreyam adhikari on instagram is shreyam1008</li>
            <li>shreyam adhikari on facebook is shreyam1008</li>
            <li>shreyam adhikari on x (twitter) is shreyam1008</li>
            <li>shreyam adhikari on youtube is shreyam1008</li>
          </ul>
        </section>

        {/* Footer credit + mini-creds bar */}
        <footer style={{
          textAlign: 'center',
          padding: '40px 20px 120px',
          opacity: 0.5,
          fontSize: 12,
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{ marginBottom: 6 }}>
            Crafted by hand · zero WebGL · zero tracking · one human
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, opacity: 0.7 }}>
            © {new Date().getFullYear()} Shreyam Adhikari · shreyam1008 · buggythegret
          </div>
        </footer>
      </div>
    </article>
  );
}
