import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNews } from "@/lib/rss-sources";
import { getDbArticles, searchArticlesDb, upsertArticles } from "@/lib/db";
import { Category, NewsFeedResponse } from "@/types/news";

export const dynamic = "force-dynamic";

let lastBackgroundSyncTime = 0;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") as Category) || undefined;
  const search = searchParams.get("q") || searchParams.get("search");
  const forceRefresh = searchParams.get("refresh") === "true";

  // 1. Search directly via Supabase if query provided
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

  // 2. If forceRefresh is requested, fetch live feeds directly
  if (forceRefresh) {
    try {
      const articles = await fetchLiveNews();
      if (articles.length > 0) {
        upsertArticles(articles).catch(console.error);
      }
      const filtered = category && category !== "all"
        ? articles.filter((a) => a.category === category)
        : articles;

      return NextResponse.json({
        articles: filtered,
        updatedAt: new Date().toISOString(),
        totalCount: filtered.length,
        fromCache: false,
      });
    } catch (e) {
      console.error("Force refresh error:", e);
    }
  }

  // 3. Database-first lookup for lightning-fast sub-50ms response
  try {
    const dbArticles = await getDbArticles(category, 50);

    // If we have database articles, return them immediately
    if (dbArticles && dbArticles.length >= 10) {
      // Check if we should trigger a background 30-minute sync
      const now = Date.now();
      const oldestAcceptableTime = now - THIRTY_MINUTES_MS;
      const newestArticleTime = new Date(dbArticles[0]?.publishedAt || 0).getTime();

      // If newest article is > 30m old or last sync was > 15m ago, trigger non-blocking background sync
      if (newestArticleTime < oldestAcceptableTime || now - lastBackgroundSyncTime > 15 * 60 * 1000) {
        lastBackgroundSyncTime = now;
        fetchLiveNews()
          .then((fresh) => {
            if (fresh.length > 0) {
              return upsertArticles(fresh);
            }
          })
          .catch((err) => console.error("Background auto-sync error:", err));
      }

      return NextResponse.json(
        {
          articles: dbArticles,
          updatedAt: dbArticles[0]?.publishedAt || new Date().toISOString(),
          totalCount: dbArticles.length,
          syncCadence: "every 30 minutes",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }
  } catch (dbErr) {
    console.warn("DB-first query failed, falling back to live RSS:", dbErr);
  }

  // 4. Fallback to live RSS fetch if DB was empty or failed
  try {
    const articles = await fetchLiveNews();
    if (articles.length > 0) {
      upsertArticles(articles).catch(console.error);
    }

    const filtered = category && category !== "all"
      ? articles.filter((a) => a.category === category)
      : articles;

    return NextResponse.json({
      articles: filtered,
      updatedAt: new Date().toISOString(),
      totalCount: filtered.length,
      fromCache: false,
    });
  } catch (rssErr) {
    console.error("Live RSS fetch failed:", rssErr);
    return NextResponse.json({ error: "Failed to fetch news feed" }, { status: 500 });
  }
}
