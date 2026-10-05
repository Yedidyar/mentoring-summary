import { QUICK_FILTERS } from '../constants/categories';
import type { CategoryKey, QuickFilter } from '../types/resource';

type QuickFiltersProps = {
  activeCategoryKey: CategoryKey | '';
  onSelect: (key: CategoryKey | '') => void;
  quickFilter: QuickFilter;
  onQuickFilter: (filter: QuickFilter) => void;
};

export function QuickFilters({
  activeCategoryKey,
  onSelect,
  quickFilter,
  onQuickFilter,
}: QuickFiltersProps) {
  return (
    <div className="quick-filters">
      <div className="chip-row" role="group" aria-label="סינון מהיר">
        <button
          type="button"
          className={`chip ${quickFilter === 'all' && !activeCategoryKey ? 'active' : ''}`}
          onClick={() => {
            onQuickFilter('all');
            onSelect('');
          }}
        >
          הכל
        </button>
        <button
          type="button"
          className={`chip ${quickFilter === 'recent' ? 'active' : ''}`}
          onClick={() => onQuickFilter('recent')}
        >
          חדש
        </button>
        <button
          type="button"
          className={`chip ${quickFilter === 'favorites' ? 'active' : ''}`}
          onClick={() => onQuickFilter('favorites')}
        >
          מועדפים
        </button>
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${activeCategoryKey === f.categoryKey ? 'active' : ''}`}
            onClick={() => {
              onQuickFilter('all');
              onSelect(f.categoryKey);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
