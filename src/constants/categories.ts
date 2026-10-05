import type { CategoryKey } from '../types/resource';

export const CATEGORY_KEYS: Record<CategoryKey, string> = {
  interviews: 'ראיונות עבודה',
  jobs: 'משרות',
  cv: 'קורות חיים ו-LinkedIn',
  dev: 'פיתוח תוכנה',
  ai: 'AI וכלי AI',
  github: 'GitHub ופרויקטים',
  career: 'קריירה',
  learning: 'למידה וקורסים',
  events: 'אירועים וכנסים',
  video: 'סרטונים ופודקאסטים',
  tools: 'כלים ואתרים',
  other: 'אחר',
};

export type QuickFilterChip = {
  id: string;
  label: string;
  categoryKey: CategoryKey;
};

export const QUICK_FILTERS: QuickFilterChip[] = [
  { id: 'interviews', label: 'ראיונות', categoryKey: 'interviews' },
  { id: 'jobs', label: 'משרות', categoryKey: 'jobs' },
  { id: 'ai', label: 'AI', categoryKey: 'ai' },
  { id: 'github', label: 'GitHub', categoryKey: 'github' },
  { id: 'cv', label: 'קורות חיים', categoryKey: 'cv' },
  { id: 'dev', label: 'פיתוח', categoryKey: 'dev' },
  { id: 'events', label: 'אירועים', categoryKey: 'events' },
  { id: 'video', label: 'וידאו', categoryKey: 'video' },
];

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: 'וידאו',
  podcast: 'פודקאסט',
  repository: 'מאגר קוד',
  form: 'טופס',
  event: 'אירוע',
  course: 'קורס',
  job: 'משרה',
  documentation: 'תיעוד',
  article: 'מאמר',
};

export const RECENT_DAYS = 30;
