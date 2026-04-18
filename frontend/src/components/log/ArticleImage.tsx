interface Props {
  src: string;
  alt: string;
  /** Intrinsic width in pixels — provide for zero CLS. */
  width?: number;
  /** Intrinsic height in pixels — provide for zero CLS. */
  height?: number;
  /** Caption text shown below. */
  caption?: string;
  /** Photo credit label (e.g. "Markus Spiske on Unsplash"). */
  credit?: string;
  /** Credit link (the source page). */
  creditUrl?: string;
  /** Load eagerly for above-the-fold (e.g. the first image). Defaults to lazy. */
  eager?: boolean;
}

/**
 * ArticleImage — lazy-loaded, aspect-ratio preserved, credited, accessible.
 * Always provide width/height to keep CLS at 0. On mobile the image scales
 * fluidly; on desktop it centers within the prose measure.
 */
export default function ArticleImage({
  src, alt, width, height,
  caption, credit, creditUrl, eager,
}: Props) {
  return (
    <figure className="log-figure">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {(caption || credit) && (
        <figcaption>
          {caption}
          {caption && credit ? ' · ' : ''}
          {credit && (
            creditUrl
              ? <a href={creditUrl} target="_blank" rel="noopener noreferrer">{credit}</a>
              : <span>{credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
