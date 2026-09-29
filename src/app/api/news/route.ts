import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNews } from "@/lib/rss-sources";
import { getDbArticles, searchArticlesDb, upsertArticles } from "@/lib/db";
import { Category, NewsFeedResponse } from "@/types/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") as Category) || undefined;
  const search = searchParams.get("q") || searchParams.get("search");

  // Search directly via Supabase if query provided
  if (search && search.trim()) {
    try {
      const articles = await searchArticlesDb(search.trim());
      const response: NewsFeedResponse = {
        articles,
        updatedAt: new Date().toISOString(),
        totalCount: articles.length,
      };
      return NextResponse.json(response);
    } catch (err) {
      console.error("Search DB error:", err);
    }
  }

  try {
    // 1. Fetch live RSS news
    const articles = await fetchLiveNews();

    // 2. Asynchronously persist to Supabase in background
    if (articles.length > 0) {
      upsertArticles(articles).catch((err) =>
        console.error("Supabase background upsert error:", err)
      );
    }

    const filtered = category && category !== "all"
      ? articles.filter((a) => a.category === category)
      : articles;

    const response: NewsFeedResponse = {
      articles: filtered,
      updatedAt: new Date().toISOString(),
      totalCount: filtered.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Live feed fetch failed, falling back to Supabase DB:", error);
    try {
      const dbArticles = await getDbArticles(category);
      const response: NewsFeedResponse = {
        articles: dbArticles,
        updatedAt: new Date().toISOString(),
        totalCount: dbArticles.length,
      };
      return NextResponse.json(response);
    } catch (dbErr) {
      console.error("DB fallback failed:", dbErr);
      return NextResponse.json({ error: "Failed to fetch feeds" }, { status: 500 });
    }
  }
}

