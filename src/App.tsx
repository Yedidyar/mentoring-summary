import { useCallback, useMemo, useState } from 'react';
import resourcesData from './data/resources.json';
import metaData from './data/meta.json';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { QuickFilters } from './components/QuickFilters';
import { StatsBar } from './components/StatsBar';
import { FilterPanel } from './components/FilterPanel';
import { ResourceCard } from './components/ResourceCard';
import { ResourceListItem } from './components/ResourceListItem';
import { DetailModal } from './components/DetailModal';
import { EmptyState } from './components/EmptyState';
import { AboutPage } from './components/AboutPage';
import { useResourceFilters } from './hooks/useResourceFilters';
import { loadFavorites, toggleFavorite } from './utils/favorites';
import { RECENT_DAYS } from './constants/categories';
import type { ExportMeta, NavId, Resource } from './types/resource';

const resources = resourcesData as Resource[];
const meta = metaData as ExportMeta;

function App() {
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [page, setPage] = useState<'home' | 'about'>('home');

  const filters = useResourceFilters(resources, favorites);

  const recentCount = useMemo(() => {
    const dates = resources.map((r) => new Date(r.latestShareDate).getTime());
    const max = Math.max(...dates);
    const cutoff = new Date(max);
    cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
    return resources.filter((r) => new Date(r.latestShareDate) >= cutoff).length;
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => toggleFavorite(id, prev));
  }, []);

  const handleNav = useCallback(
    (nav: NavId) => {
      setPage(nav === 'about' ? 'about' : 'home');
      if (nav === 'recent') {
        filters.setQuickFilter('recent');
        filters.setCategoryKey('');
      } else if (nav === 'favorites') {
        filters.setQuickFilter('favorites');
      } else if (nav === 'all' || nav === 'home') {
        filters.setQuickFilter('all');
        filters.setCategoryKey('');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [filters]
  );

  const activeNav: NavId =
    page === 'about'
      ? 'about'
      : filters.quickFilter === 'favorites'
        ? 'favorites'
        : filters.quickFilter === 'recent'
          ? 'recent'
          : 'all';

  return (
    <div className="app-shell">
      <Header activeNav={activeNav} onNav={handleNav} />

      <main className="app-main">
        {page === 'about' ? (
          <AboutPage meta={meta} />
        ) : (
          <>
            <section className="hero-compact">
              <h1 className="page-title">מנטורינג — מרכז הידע</h1>
              <p className="page-subtitle">
                כל הקישורים, הכלים והמשאבים שעלו בקבוצת המנטורינג, במקום אחד.
              </p>
              <SearchBar value={filters.query} onChange={filters.setQuery} />
              <QuickFilters
                activeCategoryKey={filters.categoryKey}
                onSelect={filters.setCategoryKey}
                quickFilter={filters.quickFilter}
                onQuickFilter={filters.setQuickFilter}
              />
              <StatsBar meta={meta} recentCount={recentCount} />
            </section>

            <div className="content-layout">
              <FilterPanel
                meta={meta}
                categoryKey={filters.categoryKey}
                setCategoryKey={filters.setCategoryKey}
                platform={filters.platform}
                setPlatform={filters.setPlatform}
                contentType={filters.contentType}
                setContentType={filters.setContentType}
                dateFrom={filters.dateFrom}
                setDateFrom={filters.setDateFrom}
                dateTo={filters.dateTo}
                setDateTo={filters.setDateTo}
                sort={filters.sort}
                setSort={filters.setSort}
                viewMode={filters.viewMode}
                setViewMode={filters.setViewMode}
                hasActiveFilters={filters.hasActiveFilters}
                clearFilters={filters.clearFilters}
                resultCount={filters.filtered.length}
              />

              <section className="results-section" aria-live="polite">
                {filters.filtered.length === 0 ? (
                  <EmptyState onClear={filters.clearFilters} />
                ) : filters.viewMode === 'list' ? (
                  <div className="resource-list">
                    {filters.filtered.map((r) => (
                      <ResourceListItem
                        key={r.id}
                        resource={r}
                        isFavorite={favorites.has(r.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetail={setDetailResource}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="resource-grid">
                    {filters.filtered.map((r) => (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        isFavorite={favorites.has(r.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetail={setDetailResource}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <p>נבנה לקהילת המנטורינג · נתונים מייצוא WhatsApp</p>
      </footer>

      <DetailModal
        resource={detailResource}
        isFavorite={detailResource ? favorites.has(detailResource.id) : false}
        onClose={() => setDetailResource(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

export default App;
