import { useEffect } from 'react';
import type { ArticleMetadata } from '../../content/articles/types';

const ORIGIN = 'https://shreyam1008.com.np';
const AUTHOR_ID = `${ORIGIN}/#person`;

/**
 * Per-article SEO: dynamic <title>, meta description, canonical, Open Graph,
 * Twitter cards, and a full schema.org `Article` + `BreadcrumbList` JSON-LD.
 *
 * Works for both fresh pages (CSR) and re-entry from the index — all tags
 * are installed on mount and cleaned up on unmount, so navigating between
 * articles produces the correct metadata for crawlers that re-scan on route
 * change (e.g. Googlebot with JS, Perplexity, Claude).
 */
export default function ArticleSEO({ meta }: { meta: ArticleMetadata }) {
  useEffect(() => {
    const url = `${ORIGIN}/log/${meta.slug}`;
    const title = meta.seoTitle || `${meta.title} — shreyam1008`;
    const desc = meta.description;
    const img = meta.ogImage || meta.cover?.src || `${ORIGIN}/icon-512x512.png`;

    const prevTitle = document.title;
    document.title = title;

    const created: HTMLElement[] = [];
    const addMeta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta');
      el.setAttribute(attr, key);
      el.setAttribute('content', content);
      el.dataset.logSeo = '1';
      document.head.appendChild(el);
      created.push(el);
    };

    // Core meta
    addMeta('name', 'description', desc);
    addMeta('name', 'author', 'Shreyam Adhikari');
    addMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    addMeta('name', 'keywords', [meta.category, ...meta.tags].join(', '));
    addMeta('name', 'article:published_time', meta.date);
    if (meta.updated) addMeta('name', 'article:modified_time', meta.updated);

    // Open Graph
    addMeta('property', 'og:type', 'article');
    addMeta('property', 'og:url', url);
    addMeta('property', 'og:title', title);
    addMeta('property', 'og:description', desc);
    addMeta('property', 'og:image', img);
    addMeta('property', 'og:site_name', 'shreyam1008');
    addMeta('property', 'article:author', 'Shreyam Adhikari');
    addMeta('property', 'article:section', meta.category);
    addMeta('property', 'article:published_time', meta.date);
    if (meta.updated) addMeta('property', 'article:modified_time', meta.updated);
    meta.tags.forEach((t) => addMeta('property', 'article:tag', t));

    // Twitter
    addMeta('name', 'twitter:card', 'summary_large_image');
    addMeta('name', 'twitter:site', '@shreyam1008');
    addMeta('name', 'twitter:creator', '@shreyam1008');
    addMeta('name', 'twitter:title', title);
    addMeta('name', 'twitter:description', desc);
    addMeta('name', 'twitter:image', img);

    // Canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url;
    canonical.dataset.logSeo = '1';
    document.head.appendChild(canonical);
    created.push(canonical);

    // JSON-LD: Article
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: meta.title,
      description: desc,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: meta.date,
      dateModified: meta.updated || meta.date,
      inLanguage: 'en',
      articleSection: meta.category,
      keywords: meta.tags.join(', '),
      timeRequired: `PT${meta.readMinutes}M`,
      author: { '@type': 'Person', '@id': AUTHOR_ID, name: 'Shreyam Adhikari', url: ORIGIN },
      publisher: {
        '@type': 'Person',
        '@id': AUTHOR_ID,
        name: 'Shreyam Adhikari',
        url: ORIGIN,
      },
      image: meta.cover
        ? {
            '@type': 'ImageObject',
            url: meta.cover.src,
            ...(meta.cover.width ? { width: meta.cover.width } : {}),
            ...(meta.cover.height ? { height: meta.cover.height } : {}),
          }
        : `${ORIGIN}/icon-512x512.png`,
      isPartOf: {
        '@type': 'Blog',
        '@id': `${ORIGIN}/log#blog`,
        name: 'The shreyam1008 Log',
        url: `${ORIGIN}/log`,
      },
    };

    // JSON-LD: BreadcrumbList
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Log', item: `${ORIGIN}/log` },
        { '@type': 'ListItem', position: 3, name: meta.title, item: url },
      ],
    };

    [articleSchema, breadcrumbSchema].forEach((s) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.logSeo = '1';
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
      created.push(script);
    });

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
    };
  }, [meta]);

  return null;
}
