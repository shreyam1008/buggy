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
          <strong>This is home.</strong> B.E. and then an M.Sc. in Computer
          Engineering — and I <em>still</em> keep an LLM tab open to center a
          div. The modern workflow: half the day is <strong>shipping code</strong>,
          the other half is <strong>prompting, steering, and fact-checking
          machines</strong> that are confidently wrong 14% of the time. It's
          a new kind of fluency; I'm here for it.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.82 }}>
          <strong>Frontend:</strong> used to be React-by-default. Now it's{' '}
          <strong>React when it earns its weight</strong>, and{' '}
          <strong>Astro, HTMX, or plain HTML</strong> when the problem is
          shaped that way. Boring &gt; shiny. Every time.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.82 }}>
          <strong>Backend:</strong> I'm not writing kernels or flight-control
          software, so <em>Rust and Zig, respectfully, nah</em> — I'm not
          here to fight my own soul for a dev-loop. Java and I never quite
          agreed on whether every noun needs a factory. My comfort zone is{' '}
          <strong>Go, written in a functional-ish style</strong>, with{' '}
          <strong>TypeScript and Python</strong> covering the rest. Between
          those three, <strong>~80% of real-world backend work</strong> is
          already handled — cleanly, shippable, with a debugger I trust.
        </p>
        <p className="me-chapter-lede" style={{ opacity: 0.75 }}>
          I ship open-source tools developers actually use — <em>GitVibes, ProtoPeek,
          GoBarryGo, dbterm, Visualise OKLCH</em>. If your terminal feels slow, there's
          a <strong>90% chance I wrote a tool to fix it</strong>.
        </p>
        <div style={{ marginTop: 24 }}>
          <span className="me-chapter-stat"><b>7+</b><span>Years shipping</span></span>
          <span className="me-chapter-stat"><b>4</b><span>Countries, same caffeine</span></span>
          <span className="me-chapter-stat"><b>Boring</b><span>&gt; Shiny · every time</span></span>
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
