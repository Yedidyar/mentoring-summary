import { formatDate, faviconUrl } from '../utils/format';
import type { Resource } from '../types/resource';

type ResourceListItemProps = {
  resource: Resource;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (resource: Resource) => void;
};

export function ResourceListItem({
  resource,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
}: ResourceListItemProps) {
  const icon = faviconUrl(resource.domain);

  return (
    <article className="resource-list-item">
      <div className="list-main">
        {icon ? (
          <img src={icon} alt="" width={18} height={18} className="list-favicon" loading="lazy" />
        ) : (
          <span className="list-favicon-fallback" aria-hidden="true">↗</span>
        )}
        <button type="button" className="list-title-btn" onClick={() => onOpenDetail(resource)} dir="auto">
          {resource.title}
        </button>
        <span className="list-category">{resource.category}</span>
        <span className="list-platform" dir="ltr">{resource.platform}</span>
        <time className="list-date" dateTime={resource.latestShareDate}>
          {formatDate(resource.latestShareDate)}
        </time>
        {resource.shareCount > 1 && (
          <span className="list-shares">{resource.shareCount}×</span>
        )}
      </div>
      <div className="list-actions">
        <button
          type="button"
          className={`favorite-btn compact ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(resource.id)}
          aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          ♥
        </button>
        <a href={resource.url} className="list-open" target="_blank" rel="noopener noreferrer">
          פתיחה
        </a>
      </div>
    </article>
  );
}
