import { formatDate, faviconUrl } from '../utils/format';
import type { Resource } from '../types/resource';

type ResourceCardProps = {
  resource: Resource;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (resource: Resource) => void;
};

export function ResourceCard({
  resource,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
}: ResourceCardProps) {
  const icon = faviconUrl(resource.domain);
  const tags = (resource.tags || []).slice(0, 3);

  return (
    <article className="resource-card">
      <div className="card-top">
        <div className="card-icon-wrap">
          {icon ? (
            <img src={icon} alt="" width={20} height={20} className="card-favicon" loading="lazy" />
          ) : (
            <span className="card-favicon-fallback" aria-hidden="true">↗</span>
          )}
        </div>
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(resource.id)}
          aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <button type="button" className="card-body-btn" onClick={() => onOpenDetail(resource)}>
        <h3 className="card-title" dir="auto">{resource.title}</h3>
        {resource.description && (
          <p className="card-desc" dir="auto">{resource.description}</p>
        )}
      </button>

      <div className="card-meta">
        <span className="category-pill">{resource.category}</span>
        {tags.map((t) => (
          <span key={t} className="tag-pill" dir="auto">{t}</span>
        ))}
      </div>

      <div className="card-footer">
        <div className="card-source" dir="ltr">
          <span>{resource.platform}</span>
          <span className="dot">·</span>
          <span>{resource.domain}</span>
        </div>
        <div className="card-dates">
          <time dateTime={resource.latestShareDate}>{formatDate(resource.latestShareDate)}</time>
        </div>
        {resource.shareCount > 1 && (
          <span className="share-count">שותף {resource.shareCount} פעמים</span>
        )}
      </div>

      <a
        href={resource.url}
        className="card-open-btn"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
      >
        פתיחת משאב
      </a>
    </article>
  );
}
