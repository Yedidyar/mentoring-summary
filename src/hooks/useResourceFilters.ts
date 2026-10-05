import { useMemo, useState, useCallback } from 'react';
import { RECENT_DAYS } from '../constants/categories';
import { matchesSearch, normalizeSearchTerm } from '../utils/search';
import type { CategoryKey, QuickFilter, Resource, SortMode, ViewMode } from '../types/resource';

const VIEW_KEY = 'mentoring-hub-view';

export function loadViewMode(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === 'list' ? 'list' : 'cards';
  } catch {
    return 'cards';
  }
}

function saveViewMode(mode: ViewMode): void {
  localStorage.setItem(VIEW_KEY, mode);
}

export function useResourceFilters(resources: Resource[], favorites: Set<string>) {
  const [query, setQuery] = useState('');
  const [categoryKey, setCategoryKey] = useState<CategoryKey | ''>('');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [viewMode, setViewModeState] = useState<ViewMode>(loadViewMode);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    saveViewMode(mode);
  }, []);

  const recentCutoff = useMemo(() => {
    const dates = resources.map((r) => new Date(r.latestShareDate).getTime());
    const max = Math.max(...dates);
    const d = new Date(max);
    d.setDate(d.getDate() - RECENT_DAYS);
    return d;
  }, [resources]);

  const filtered = useMemo(() => {
    const q = normalizeSearchTerm(query);
    let list = resources.filter((r) => matchesSearch(r, q));

    if (quickFilter === 'favorites') {
      list = list.filter((r) => favorites.has(r.id));
    } else if (quickFilter === 'recent') {
      list = list.filter((r) => new Date(r.latestShareDate) >= recentCutoff);
    }

    if (categoryKey) list = list.filter((r) => r.categoryKey === categoryKey);
    if (platform) list = list.filter((r) => r.platform === platform);
    if (contentType) list = list.filter((r) => r.contentType === contentType);
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((r) => new Date(r.latestShareDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((r) => new Date(r.latestShareDate) <= to);
    }

    const sorted = [...list];
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.latestShareDate).getTime() - new Date(b.latestShareDate).getTime());
        break;
      case 'alpha':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'he'));
        break;
      case 'shares':
        sorted.sort((a, b) => b.shareCount - a.shareCount);
        break;
      default:
        sorted.sort((a, b) => new Date(b.latestShareDate).getTime() - new Date(a.latestShareDate).getTime());
    }
    return sorted;
  }, [
    resources,
    query,
    categoryKey,
    platform,
    contentType,
    dateFrom,
    dateTo,
    quickFilter,
    sort,
    favorites,
    recentCutoff,
  ]);

  const hasActiveFilters = Boolean(
    categoryKey ||
      platform ||
      contentType ||
      dateFrom ||
      dateTo ||
      query ||
      (quickFilter !== 'all' && quickFilter !== 'recent')
  );

  const clearFilters = useCallback(() => {
    setQuery('');
    setCategoryKey('');
    setPlatform('');
    setContentType('');
    setDateFrom('');
    setDateTo('');
    setQuickFilter('all');
    setSort('newest');
  }, []);

  return {
    query,
    setQuery,
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
    quickFilter,
    setQuickFilter,
    sort,
    setSort,
    viewMode,
    setViewMode,
    filtered,
    hasActiveFilters,
    clearFilters,
    recentCutoff,
  };
}
