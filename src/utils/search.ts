import type { Resource } from '../types/resource';

export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

export function resourceSearchText(resource: Resource): string {
  return [
    resource.title,
    resource.description,
    resource.originalMessage,
    resource.domain,
    resource.platform,
    resource.category,
    ...(resource.tags || []),
    ...(resource.shares || []).map((s) => s.snippet),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesSearch(resource: Resource, query: string): boolean {
  if (!query) return true;
  const hay = resourceSearchText(resource);
  const parts = query.split(/\s+/).filter(Boolean);
  return parts.every((p) => hay.includes(p));
}
