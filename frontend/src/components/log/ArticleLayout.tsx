import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import type { ArticleMetadata } from '../../content/articles/types';
import ArticleSEO from './ArticleSEO';
import References from './References';

interface Props {
  meta: ArticleMetadata;
  /** Article body (React children). */
  children: ReactNode;
  /** Adjacent posts for prev/next nav. */
  prev?: ArticleMetadata;
  next?: ArticleMetadata;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Reading progress bar — tracks scroll position of #log-article.
 * CSS-only would need a container-query; this is 4 lines of JS and works.
 */
function useScrollProgress(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      setP(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

export default function ArticleLayout({ meta, children, prev, next }: Props) {
  const progress = useScrollProgress();

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [meta.slug]);

  return (
    <article className="log-root" itemScope itemType="https://schema.org/Article">
      <ArticleSEO meta={meta} />
      <a href="#log-article-main" className="log-skip">Skip to content</a>

      <div className="log-progress" aria-hidden="true">
        <div className="log-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="log-article">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="log-crumbs">
          <Link href="/"><a>~</a></Link>
          <span className="sep">/</span>
          <Link href="/log"><a>log</a></Link>
          <span className="sep">/</span>
          <span>{new Date(meta.date).getFullYear()}</span>
          <span className="sep">/</span>
          <span>{meta.slug}.md</span>
        </nav>

        {/* Back button */}
        <Link href="/log">
          <a className="log-back">
            <span aria-hidden="true">←</span> back to log
          </a>
        </Link>

        {/* Header */}
        <header className="log-article-head" id="log-article-main">
          <div className="cat" itemProp="articleSection">{meta.category}</div>
          <h1 itemProp="headline">{meta.title}</h1>
          {meta.subtitle && <p className="subtitle">{meta.subtitle}</p>}
          <div className="bits">
            <span><span className="k">published:</span> <time dateTime={meta.date} itemProp="datePublished">{formatDate(meta.date)}</time></span>
            {meta.updated && (
              <span><span className="k">updated:</span> <time dateTime={meta.updated} itemProp="dateModified">{formatDate(meta.updated)}</time></span>
            )}
            <span><span className="k">read:</span> {meta.readMinutes} min</span>
            <span><span className="k">author:</span> <span itemProp="author">Shreyam Adhikari</span></span>
          </div>
        </header>

        {/* Cover */}
        {meta.cover && (
          <figure className="log-cover">
            <img
              src={meta.cover.src}
              alt={meta.cover.alt}
              width={meta.cover.width}
              height={meta.cover.height}
              loading="eager"
              decoding="async"
              itemProp="image"
            />
            {(meta.cover.credit || meta.cover.alt) && (
              <figcaption>
                {meta.cover.alt}
                {meta.cover.credit && (
                  <>
                    {' · '}
                    {meta.cover.creditUrl ? (
                      <a href={meta.cover.creditUrl} target="_blank" rel="noopener noreferrer">
                        {meta.cover.credit}
                      </a>
                    ) : (
                      <span>{meta.cover.credit}</span>
                    )}
                  </>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Body */}
        <div className="log-prose" itemProp="articleBody">
          {children}
        </div>

        {/* References */}
        {meta.references && meta.references.length > 0 && (
          <References items={meta.references} />
        )}

        {/* Prev / Next */}
        {(prev || next) && (
          <nav className="log-nav" aria-label="Adjacent posts">
            {prev ? (
              <Link href={`/log/${prev.slug}`}>
                <a>
                  <div className="lbl">← Previous</div>
                  <div className="ttl">{prev.title}</div>
                </a>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/log/${next.slug}`}>
                <a className="next">
                  <div className="lbl">Next →</div>
                  <div className="ttl">{next.title}</div>
                </a>
              </Link>
            ) : <div />}
          </nav>
        )}

        <div className="log-sig">
          $ echo "thanks for reading" · <Link href="/me"><a>meet the author</a></Link>
        </div>
      </div>
    </article>
  );
}
