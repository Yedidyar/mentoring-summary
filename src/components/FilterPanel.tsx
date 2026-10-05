import { CATEGORY_KEYS, CONTENT_TYPE_LABELS } from '../constants/categories';
import type { CategoryKey, ExportMeta, SortMode, ViewMode } from '../types/resource';

type FilterPanelProps = {
  meta: ExportMeta;
  categoryKey: CategoryKey | '';
  setCategoryKey: (key: CategoryKey | '') => void;
  platform: string;
  setPlatform: (value: string) => void;
  contentType: string;
  setContentType: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  sort: SortMode;
  setSort: (value: SortMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  resultCount: number;
};

export function FilterPanel({
  meta,
  categoryKey,
  setCategoryKey,
  platform,
  setPlatform,
  contentType,
  setContentType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sort,
  setSort,
  viewMode,
  setViewMode,
  hasActiveFilters,
  clearFilters,
  resultCount,
}: FilterPanelProps) {
  const categories = Object.entries(CATEGORY_KEYS) as [CategoryKey, string][];

  return (
    <aside className="filter-panel" aria-label="סינון ומיון">
      <div className="filter-panel-top">
        <span className="result-count">{resultCount} תוצאות</span>
        <div className="view-toggle" role="group" aria-label="תצוגה">
          <button
            type="button"
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            aria-pressed={viewMode === 'cards'}
          >
            כרטיסים
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            רשימה
          </button>
        </div>
      </div>

      <div className="filter-grid">
        <label className="filter-field">
          <span>קטגוריה</span>
          <select
            value={categoryKey}
            onChange={(e) => setCategoryKey(e.target.value as CategoryKey | '')}
          >
            <option value="">כל הקטגוריות</option>
            {categories.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>מקור / פלטפורמה</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">כל המקורות</option>
            {meta.platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>סוג תוכן</span>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="">כל הסוגים</option>
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>מתאריך</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>

        <label className="filter-field">
          <span>עד תאריך</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>

        <label className="filter-field">
          <span>מיון</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
            <option value="newest">החדש ביותר</option>
            <option value="oldest">הישן ביותר</option>
            <option value="alpha">אלפביתי</option>
            <option value="shares">הכי משותף</option>
          </select>
        </label>
      </div>

      {hasActiveFilters && (
        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
          נקה סינון
        </button>
      )}
    </aside>
  );
}
