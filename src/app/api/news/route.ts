import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNews } from "@/lib/rss-sources";
import { getDbArticles, searchArticlesDb, upsertArticles } from "@/lib/db";
import { Article, Category } from "@/types/news";

export const dynamic = "force-dynamic";

// Basic in-memory IP rate limiter: max 60 requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (record.count >= 60) {
    return false;
  }
  record.count++;
  return true;
}

/**
 * Sanitizes an article payload to excerpts and honest attribution only.
 * Never leaks full scraped third-party text through the public API.
 */
function sanitizeForApi(article: Article) {
  const hasAuthor = article.author && article.author !== article.source && !article.author.toLowerCase().includes("staff");
  const authorDisplay = hasAuthor ? `${article.author} · via ${article.source}` : `via ${article.source}`;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    aiSummary: article.aiSummary || null,
    whyItMatters: article.whyItMatters || null,
    isAiSummary: Boolean(article.isAiSummary),
    source: article.source,
    sourceUrl: article.sourceUrl,
    url: article.url,
    publishedAt: article.publishedAt,
    category: article.category,
    readingTimeMinutes: article.readingTimeMinutes,
    author: authorDisplay,
    imageUrl: article.imageUrl || null,
    alsoCoveredBy: article.alsoCoveredBy || [],
    tags: article.tags || [],
  };
}

let lastBackgroundSyncTime = 0;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  // Rate limiting check
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. aitalky public API allows up to 60 requests per minute per IP." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") as Category) || undefined;
  const search = searchParams.get("q") || searchParams.get("search");
  const forceRefresh = searchParams.get("refresh") === "true";

  // Pagination parameters with sensible limits
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const limitParam = parseInt(searchParams.get("limit") || "20", 10);
  const limit = isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 50);

  // 1. Search query
  if (search && search.trim()) {
    try {
      const articles = await searchArticlesDb(search.trim(), 50);
      const totalCount = articles.length;
      const startIndex = (page - 1) * limit;
      const paginated = articles.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        articles: paginated.map(sanitizeForApi),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return NextResponse.json({ error: "Failed to query articles" }, { status: 500 });
    }
  }

  // 2. Force refresh
  if (forceRefresh) {
    try {
      const live = await fetchLiveNews();
      if (live.length > 0) {
        upsertArticles(live).catch(console.error);
      }
      const filtered = category && category !== "all"
        ? live.filter((a) => a.category === category)
        : live;

      const totalCount = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return NextResponse.json(
        {
          articles: paginated.map(sanitizeForApi),
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
          },
          updatedAt: new Date().toISOString(),
          fromCache: false,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        }
      );
    } catch {
      return NextResponse.json({ error: "Failed to force refresh feeds" }, { status: 500 });
    }
  }

  // 3. Database lookup with background sync
  try {
    const allDbArticles = await getDbArticles(category, 150);

    if (allDbArticles && allDbArticles.length >= 5) {
      const now = Date.now();
      const oldestAcceptableTime = now - THIRTY_MINUTES_MS;
      const newestArticleTime = new Date(allDbArticles[0]?.publishedAt || 0).getTime();

      if (newestArticleTime < oldestAcceptableTime || now - lastBackgroundSyncTime > 15 * 60 * 1000) {
        lastBackgroundSyncTime = now;
        fetchLiveNews()
          .then((fresh) => {
            if (fresh.length > 0) return upsertArticles(fresh);
          })
          .catch(console.error);
      }

      const totalCount = allDbArticles.length;
      const startIndex = (page - 1) * limit;
      const paginated = allDbArticles.slice(startIndex, startIndex + limit);

      return NextResponse.json(
        {
          articles: paginated.map(sanitizeForApi),
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
          },
          updatedAt: allDbArticles[0]?.publishedAt || new Date().toISOString(),
          syncCadence: "every 30 minutes",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        }
      );
    }
  } catch (dbErr) {
    console.warn("DB query fallback:", dbErr);
  }

  // 4. Live RSS fallback
  try {
    const liveArticles = await fetchLiveNews();
    if (liveArticles.length > 0) {
      upsertArticles(liveArticles).catch(console.error);
    }

    const filtered = category && category !== "all"
      ? liveArticles.filter((a) => a.category === category)
      : liveArticles;

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        articles: paginated.map(sanitizeForApi),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch news feed" },
      { status: 500 }
    );
  }
}
