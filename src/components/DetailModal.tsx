import { useEffect, useRef } from 'react';
import { formatDate, faviconUrl } from '../utils/format';
import { CONTENT_TYPE_LABELS } from '../constants/categories';
import type { Resource } from '../types/resource';

type DetailModalProps = {
  resource: Resource | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
};

export function DetailModal({ resource, isFavorite, onClose, onToggleFavorite }: DetailModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!resource) return;

    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [resource, onClose]);

  if (!resource) return null;

  const icon = faviconUrl(resource.domain);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            {icon && <img src={icon} alt="" width={24} height={24} />}
            <h2 id="detail-title" dir="auto">{resource.title}</h2>
          </div>
          <button type="button" ref={closeRef} className="modal-close" onClick={onClose} aria-label="סגירה">
            ×
          </button>
        </div>

        {resource.description && (
          <p className="modal-desc" dir="auto">{resource.description}</p>
        )}

        <dl className="modal-meta">
          <div>
            <dt>קטגוריה</dt>
            <dd>{resource.category}</dd>
          </div>
          <div>
            <dt>מקור</dt>
            <dd dir="ltr">{resource.platform} · {resource.domain}</dd>
          </div>
          <div>
            <dt>סוג</dt>
            <dd>{CONTENT_TYPE_LABELS[resource.contentType] || resource.contentType}</dd>
          </div>
          <div>
            <dt>תאריך שיתוף אחרון</dt>
            <dd>{formatDate(resource.latestShareDate)}</dd>
          </div>
          {resource.shareCount > 1 && (
            <div>
              <dt>שיתופים</dt>
              <dd>{resource.shareCount} פעמים בקבוצה</dd>
            </div>
          )}
        </dl>

        {resource.tags.length > 0 && (
          <div className="modal-tags">
            {resource.tags.map((t) => (
              <span key={t} className="tag-pill" dir="auto">{t}</span>
            ))}
          </div>
        )}

        <details className="modal-context">
          <summary>הקשר מהשיחה בקבוצה</summary>
          <p dir="auto" className="modal-message">{resource.originalMessage}</p>
        </details>

        <div className="modal-actions">
          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
            onClick={() => onToggleFavorite(resource.id)}
          >
            {isFavorite ? 'במועדפים' : 'הוסף למועדפים'}
          </button>
          <a href={resource.url} className="card-open-btn" target="_blank" rel="noopener noreferrer" dir="ltr">
            פתיחת הקישור
          </a>
        </div>
      </div>
    </div>
  );
}
