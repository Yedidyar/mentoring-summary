const STORAGE_KEY = 'mentoring-hub-favorites';

export function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveFavorites(set: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function toggleFavorite(id: string, favorites: Set<string>): Set<string> {
  const next = new Set(favorites);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveFavorites(next);
  return next;
}
