import { Suspense, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import '../styles/log.css';
import ArticleLayout from '../components/log/ArticleLayout';
import { articles, articlesSorted } from '../content/articles';

function Loader() {
  return (
    <div className="log-root" style={{ minHeight: '60vh' }}>
      <div className="log-window">
        <div className="log-prompt" style={{ textAlign: 'center', padding: 48 }}>
          <span className="dollar">$</span> loading article<span className="cursor" aria-hidden="true" style={{
            display: 'inline-block', width: '0.5em', height: '1em',
            background: 'currentColor', marginLeft: 4, verticalAlign: 'text-bottom',
            animation: 'log-blink 1.1s steps(1) infinite',
          }} />
        </div>
      </div>
    </div>
  );
}

export default function LogArticle() {
  const [, params] = useRoute<{ slug: string }>('/log/:slug');
  const slug = params?.slug ?? '';
  const entry = articles[slug];

  // Compute prev / next for chrono-adjacent navigation
  const { prev, next } = useMemo(() => {
    const idx = articlesSorted.findIndex((a) => a.metadata.slug === slug);
    if (idx < 0) return { prev: undefined, next: undefined };
    return {
      next: articlesSorted[idx - 1]?.metadata, // newer = lower idx in sorted-desc
      prev: articlesSorted[idx + 1]?.metadata,
    };
  }, [slug]);

  if (!entry) {
    return (
      <div className="log-root">
        <div className="log-window">
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="log-prompt" style={{ marginBottom: 16 }}>
              <span style={{ color: '#ef4444' }}>$</span> cat {slug || '???'}.md
              <br />
              <span style={{ color: 'var(--log-text-faint)' }}>
                cat: {slug || '???'}.md: No such file or directory
              </span>
            </div>
            <Link href="/log"><a className="log-back">← back to log</a></Link>
          </div>
        </div>
      </div>
    );
  }

  const { Component, metadata } = entry;

  return (
    <Suspense fallback={<Loader />}>
      <ArticleLayout meta={metadata} prev={prev} next={next}>
        <Component />
      </ArticleLayout>
    </Suspense>
  );
}

