import { Link } from 'wouter';
import type { ArticleMetadata } from '../../content/articles/types';

interface Props {
  meta: ArticleMetadata;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function ArticleCard({ meta }: Props) {
  const dateStr = formatDate(meta.date);
  return (
    <Link href={`/log/${meta.slug}`}>
      <a
        className={`log-card ${meta.featured ? 'log-featured' : ''}`}
        aria-label={`${meta.title} — ${meta.description}`}
      >
        <div className="log-card-meta">
          <span className="cat">{meta.category}</span>
          <span className="dot">·</span>
          <span>{dateStr}</span>
          <span className="dot">·</span>
          <span>{meta.readMinutes} min</span>
        </div>
        <h3>{meta.title}</h3>
        <p>{meta.description}</p>
        {meta.tags.length > 0 && (
          <div className="log-card-tags">
            {meta.tags.slice(0, 4).map((t) => (
              <span key={t} className="log-card-tag">#{t}</span>
            ))}
          </div>
        )}
      </a>
    </Link>
  );
}
