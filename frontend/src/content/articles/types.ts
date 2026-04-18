/**
 * Content types for the /log blog. No CMS — articles are plain TSX modules.
 * Each article file exports:
 *   - `metadata`  (synchronous, for index/listing/SEO)
 *   - default React component (lazy-loaded body)
 */

export type Category =
  | 'Book Review'
  | 'Cycling'
  | 'Tech'
  | 'Psychology'
  | 'Spiritual'
  | 'Gaming'
  | 'Journal'
  | 'Accomplishment';

export interface Reference {
  /** Stable id used in the text like [1]. */
  id: string;
  /** Human label shown in the references list. */
  label: string;
  /** Optional hyperlink target. */
  url?: string;
  /** Optional author name. */
  author?: string;
  /** Optional year. */
  year?: number;
}

export interface CoverImage {
  src: string;
  alt: string;
  /** Who made/owns the image (e.g. "Markus Spiske on Unsplash"). */
  credit?: string;
  /** Link to the source page for attribution. */
  creditUrl?: string;
  /** Intrinsic width/height to prevent CLS. */
  width?: number;
  height?: number;
}

export interface ArticleMetadata {
  /** URL slug, kebab-case. `/log/:slug`. */
  slug: string;
  /** Title shown on the card and at the top of the article. */
  title: string;
  /** One-line summary (used in cards + meta description). */
  description: string;
  /** Published date — ISO (YYYY-MM-DD). BACKDATE FREELY. */
  date: string;
  /** Optional last-modified date. */
  updated?: string;
  /** Primary category — drives the filter. */
  category: Category;
  /** Secondary tags, free-form. */
  tags: string[];
  /** Manually-estimated read time in minutes (honest > automatic). */
  readMinutes: number;
  /** Optional hero image shown at the top of the article + on the card. */
  cover?: CoverImage;
  /** Numbered references shown at the bottom of the article. */
  references?: Reference[];
  /** If true, pinned at the top of the index. */
  featured?: boolean;
  /** Override page <title>. Defaults to `title`. */
  seoTitle?: string;
  /** Override OG/twitter image. Defaults to cover.src. */
  ogImage?: string;
  /** Short computer-readable subtitle for the terminal chrome. */
  subtitle?: string;
}
