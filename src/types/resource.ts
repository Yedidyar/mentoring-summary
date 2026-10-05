export type CategoryKey =
  | 'interviews'
  | 'jobs'
  | 'cv'
  | 'dev'
  | 'ai'
  | 'github'
  | 'career'
  | 'learning'
  | 'events'
  | 'video'
  | 'tools'
  | 'other';

export type ContentType =
  | 'video'
  | 'podcast'
  | 'repository'
  | 'form'
  | 'event'
  | 'course'
  | 'job'
  | 'documentation'
  | 'article';

export type ResourceShare = {
  date: string;
  snippet: string;
};

export type Resource = {
  id: string;
  url: string;
  title: string;
  description: string;
  originalMessage: string;
  firstShareDate: string;
  latestShareDate: string;
  domain: string;
  platform: string;
  contentType: ContentType;
  category: string;
  categoryKey: CategoryKey;
  tags: string[];
  shareCount: number;
  shares: ResourceShare[];
};

export type ExportMeta = {
  generatedAt: string;
  sourceFile: string;
  totalLines: number;
  totalMessages: number;
  nonSystemMessages: number;
  urlOccurrences: number;
  uniqueResources: number;
  categoriesCount: number;
  platformsCount: number;
  dateRange: { from: string; to: string };
  categories: string[];
  platforms: string[];
};

export type ViewMode = 'cards' | 'list';
export type SortMode = 'newest' | 'oldest' | 'alpha' | 'shares';
export type QuickFilter = 'all' | 'recent' | 'favorites';
export type NavId = 'home' | 'all' | 'recent' | 'favorites' | 'about';
