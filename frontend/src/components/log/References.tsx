import type { Reference } from '../../content/articles/types';

interface Props {
  items: Reference[];
}

/**
 * Numbered references / footnotes block. Use with `[1]` inline markers in prose
 * so humans and LLMs can trace claims back to sources.
 */
export default function References({ items }: Props) {
  if (!items.length) return null;
  return (
    <section className="log-refs" aria-labelledby="refs-title">
      <h3 id="refs-title">References</h3>
      <ol>
        {items.map((r) => (
          <li key={r.id} id={`ref-${r.id}`}>
            {r.author && <span>{r.author}. </span>}
            {r.url ? (
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>
            ) : (
              <span>{r.label}</span>
            )}
            {r.year && <span> ({r.year})</span>}.
          </li>
        ))}
      </ol>
    </section>
  );
}
