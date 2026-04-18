import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import '../styles/log.css';
import TerminalChrome from '../components/log/TerminalChrome';
import ArticleCard from '../components/log/ArticleCard';
import { articlesSorted, categories } from '../content/articles';
import type { Category } from '../content/articles/types';

const PAGE_TITLE = 'Log — writings by Shreyam Adhikari (shreyam1008)';
const PAGE_DESC =
  'Long-form writing by Shreyam Adhikari (shreyam1008): book reviews, cycling ' +
  'journal, tech deep-dives, psychology notes, spiritual reflections, gaming ' +
  'takes. No algorithm, no tracking, no pop-ups — just a plain index.';

function installSEO() {
  const ORIGIN = 'https://shreyam1008.com.np';
  const url = `${ORIGIN}/log`;
  const prev = document.title;
  document.title = PAGE_TITLE;

  const created: HTMLElement[] = [];
  const add = (attr: 'name' | 'property', k: string, v: string) => {
    const el = document.createElement('meta');
    el.setAttribute(attr, k);
    el.setAttribute('content', v);
    el.dataset.logSeo = '1';
    document.head.appendChild(el);
    created.push(el);
  };

  add('name', 'description', PAGE_DESC);
  add('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');
  add('property', 'og:type', 'website');
  add('property', 'og:url', url);
  add('property', 'og:title', PAGE_TITLE);
  add('property', 'og:description', PAGE_DESC);
  add('property', 'og:image', `${ORIGIN}/icon-512x512.png`);
  add('name', 'twitter:card', 'summary');
  add('name', 'twitter:title', PAGE_TITLE);
  add('name', 'twitter:description', PAGE_DESC);

  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = url;
  canonical.dataset.logSeo = '1';
  document.head.appendChild(canonical);
  created.push(canonical);

  // JSON-LD: Blog + ItemList
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    name: 'The shreyam1008 Log',
    description: PAGE_DESC,
    url,
    inLanguage: 'en',
    author: { '@type': 'Person', '@id': `${ORIGIN}/#person`, name: 'Shreyam Adhikari' },
  };
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: articlesSorted.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${url}/${a.metadata.slug}`,
      name: a.metadata.title,
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Log', item: url },
    ],
  };
  [blogSchema, itemListSchema, breadcrumb].forEach((s) => {
    const sc = document.createElement('script');
    sc.type = 'application/ld+json';
    sc.dataset.logSeo = '1';
    sc.textContent = JSON.stringify(s);
    document.head.appendChild(sc);
    created.push(sc);
  });

  return () => {
    document.title = prev;
    created.forEach((el) => el.remove());
  };
}

export default function Log() {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [year, setYear] = useState<number | 'All'>('All');
  const [query, setQuery] = useState('');

  useEffect(() => installSEO(), []);

  const years = useMemo(() => {
    const set = new Set<number>();
    articlesSorted.forEach((a) => set.add(new Date(a.metadata.date).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articlesSorted.filter(({ metadata: m }) => {
      if (category !== 'All' && m.category !== category) return false;
      if (year !== 'All' && new Date(m.date).getFullYear() !== year) return false;
      if (q) {
        const hay = `${m.title} ${m.description} ${m.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [category, year, query]);

  // Put featured/pinned first, otherwise keep date-sorted (already sorted)
  const displayed = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.metadata.featured && !b.metadata.featured) return -1;
      if (!a.metadata.featured && b.metadata.featured) return 1;
      return 0;
    });
  }, [filtered]);

  return (
    <div className="log-root">
      <div className="log-window">
        <TerminalChrome tab="~/log — bash" meta={`${displayed.length}/${articlesSorted.length} files`}>
          {/* Hero */}
          <div className="log-index-hero">
            <div className="log-prompt">
              <span className="dollar">$</span> <span className="path">cd ~/log</span> &amp;&amp;{' '}
              <span className="path">ls</span> <span className="flag">-la --sort=time</span>
            </div>
            <h1>
              The Log<span className="cursor" aria-hidden="true" />
            </h1>
            <p>
              Writings by <Link href="/me"><a style={{ color: 'var(--log-accent-3)' }}>Shreyam Adhikari</a></Link>.
              Book reviews, rides, reflections, tech notes, occasional loud opinions.
              No tracking. No algorithm. No newsletter pop-up. Just the files.
            </p>
          </div>

          {/* Filters */}
          <div className="log-filters" role="toolbar" aria-label="Filter log entries">
            <div className="log-filter-group" role="group" aria-label="Filter by category">
              <span className="log-filter-label">cat:</span>
              <button
                className="log-chip"
                aria-pressed={category === 'All'}
                onClick={() => setCategory('All')}
              >
                all
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className="log-chip"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c.toLowerCase()}
                </button>
              ))}
            </div>

            {years.length > 1 && (
              <div className="log-filter-group" role="group" aria-label="Filter by year">
                <span className="log-filter-label">yr:</span>
                <button
                  className="log-chip"
                  aria-pressed={year === 'All'}
                  onClick={() => setYear('All')}
                >
                  all
                </button>
                {years.map((y) => (
                  <button
                    key={y}
                    className="log-chip"
                    aria-pressed={year === y}
                    onClick={() => setYear(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            <label className="log-search">
              <span aria-hidden="true">grep</span>
              <input
                type="search"
                placeholder="filter by title, tag, or text…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search log entries"
              />
            </label>
          </div>

          {/* Listing header (ls-style) */}
          <div className="log-listing-header" aria-hidden="true">
            <span>entries</span>
            <span>{displayed.length} match{displayed.length === 1 ? '' : 'es'}</span>
          </div>

          {/* Cards */}
          {displayed.length > 0 ? (
            <div className="log-cards">
              {displayed.map(({ metadata }) => (
                <ArticleCard key={metadata.slug} meta={metadata} />
              ))}
            </div>
          ) : (
            <div className="log-empty">
              <div>no entries match.</div>
              <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
                try <button className="log-chip" onClick={() => { setCategory('All'); setYear('All'); setQuery(''); }}>clear filters</button>
              </div>
            </div>
          )}
        </TerminalChrome>
      </div>
    </div>
  );
}
