import { formatDate } from '../utils/format';
import type { ExportMeta } from '../types/resource';

type StatsBarProps = {
  meta: ExportMeta;
  recentCount: number;
};

export function StatsBar({ meta, recentCount }: StatsBarProps) {
  return (
    <section className="stats-bar" aria-label="סטטיסטיקות">
      <div className="stat">
        <span className="stat-value">{meta.uniqueResources}</span>
        <span className="stat-label">משאבים ייחודיים</span>
      </div>
      <div className="stat">
        <span className="stat-value">{recentCount}</span>
        <span className="stat-label">חדשים (30 יום)</span>
      </div>
      <div className="stat">
        <span className="stat-value">{meta.categoriesCount}</span>
        <span className="stat-label">קטגוריות</span>
      </div>
      <div className="stat">
        <span className="stat-value">{meta.platformsCount}</span>
        <span className="stat-label">מקורות</span>
      </div>
      <p className="stats-range">
        טווח תאריכים: {formatDate(meta.dateRange.from)} – {formatDate(meta.dateRange.to)}
      </p>
    </section>
  );
}
