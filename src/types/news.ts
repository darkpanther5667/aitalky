export type Category = 
  | "all"
  | "industry"
  | "research"
  | "products"
  | "culture"
  | "policy";

export interface AlsoCoveredBy {
  source: string;
  url: string;
  title?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  sourceUrl: string;
  url: string;
  publishedAt: string;
  category: Category;
  readingTimeMinutes: number;
  author: string;
  authorRole?: string;
  imageUrl?: string;
  keyPoints?: string[];
  tags: string[];
  views?: number;
  likes?: number;
  alsoCoveredBy?: AlsoCoveredBy[];
  aiSummary?: string;
  whyItMatters?: string;
  isAiSummary?: boolean;
}

export interface NewsFeedResponse {
  articles: Article[];
  updatedAt: string;
  totalCount: number;
}
