export default function ChapterCode() {
  return (
    <section
      id="chapter-code"
      className="me-chapter me-scene"
      style={{
        ['--chapter-grad' as string]: 'linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%)',
        ['--chapter-accent' as string]: '#79c0ff',
      } as React.CSSProperties}
      aria-labelledby="chapter-code-title"
    >
      <div>
        <div className="me-chapter-kicker">I · The Base</div>
        <h2 id="chapter-code-title" className="me-chapter-title">Binary<br />Realm</h2>
        <p className="me-chapter-lede">
          <strong>This is home.</strong> B.E. in Computer Engineering, Master's in CS, still
          Googling how to center a div. Shreyam Adhikari — full-stack since before
          it was a buzzword, <strong>Go on the backend</strong>,{' '}
          <strong>React 19 on the frontend</strong>, Cloudflare Workers at the edge,
          and opinions that outnumber my commits.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          I ship open-source tools developers actually use — <em>GitVibes, ProtoPeek,
          GoBarryGo, dbterm, Visualise OKLCH</em>. If your terminal feels slow, there's
          a <strong>90% chance I wrote a tool to fix it</strong>.
        </p>
        <div style={{ marginTop: 24 }}>
          <span className="me-chapter-stat"><b>7+</b><span>Years shipping</span></span>
          <span className="me-chapter-stat"><b>4</b><span>Countries, same caffeine</span></span>
          <span className="me-chapter-stat"><b>∞</b><span>Semicolons debated</span></span>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="me-cta" href="https://github.com/shreyam1008" target="_blank" rel="noopener noreferrer">
            🐙 GitHub · shreyam1008
          </a>
          <a className="me-cta me-cta-ghost" href="https://shreyam1008.com.np/" target="_blank" rel="noopener noreferrer">
            Tools Homepage →
          </a>
        </div>
      </div>

      {/* Scene panel — floating code cards in 3D */}
      <div className="me-scene-panel" aria-hidden="true">
        <div
          className="me-code-card"
          style={{ top: '8%', left: '6%', ['--ry' as string]: '-8deg', animationDelay: '-2s' } as React.CSSProperties}
        >
          <span className="kw">func</span> <span className="fn">ship</span>(dream) {'{'}
          <br />&nbsp;&nbsp;<span className="kw">return</span> <span className="str">"tomorrow"</span> {'}'}
        </div>
        <div
          className="me-code-card"
          style={{ top: '28%', right: '4%', ['--ry' as string]: '10deg', animationDelay: '-4s' } as React.CSSProperties}
        >
          <span className="cm">// TODO: sleep</span><br />
          <span className="kw">while</span> (caffeine &gt; 0) {'{'}<br />
          &nbsp;&nbsp;<span className="fn">commit</span>()<br />
          {'}'}
        </div>
        <div
          className="me-code-card"
          style={{ top: '52%', left: '12%', ['--ry' as string]: '-4deg', animationDelay: '-6s' } as React.CSSProperties}
        >
          <span className="kw">const</span> me = {'{'}<br />
          &nbsp;&nbsp;name: <span className="str">'shreyam1008'</span>,<br />
          &nbsp;&nbsp;tabs: <span className="kw">true</span>,<br />
          &nbsp;&nbsp;ego: <span className="kw">false</span><br />
          {'}'}
        </div>
        <div
          className="me-code-card"
          style={{ bottom: '8%', right: '8%', ['--ry' as string]: '6deg', animationDelay: '-3s' } as React.CSSProperties}
        >
          $ bun run ship --prod<br />
          <span className="cm">→ built in 420ms ✨</span>
        </div>
        <div
          className="me-code-card"
          style={{ top: '72%', left: '2%', ['--ry' as string]: '-12deg', animationDelay: '-7s' } as React.CSSProperties}
        >
          <span className="kw">git</span> push --force<br />
          <span className="cm"># jk. never on main.</span>
        </div>
      </div>
    </section>
  );
}
