export type Category = 
  | "all"
  | "industry"
  | "research"
  | "products"
  | "culture"
  | "policy";

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
}

export interface NewsFeedResponse {
  articles: Article[];
  updatedAt: string;
  totalCount: number;
}
