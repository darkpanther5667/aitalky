import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNews } from "@/lib/rss-sources";
import { upsertArticles, getDbArticles } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient time for all RSS feeds

const VALID_CRON_SECRET = process.env.CRON_SECRET || "aitalky-cron-30min-key";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${VALID_CRON_SECRET}`) {
    return true;
  }
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key && key === VALID_CRON_SECRET) {
    return true;
  }
  // Vercel Cron automatically includes header: x-vercel-cron
  if (request.headers.get("x-vercel-cron")) {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  const startTime = Date.now();

  // Validate authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid Bearer token or ?key= query parameter." },
      { status: 401 }
    );
  }

  try {
    console.log(`[Cron 30m] Starting scheduled AI news ingestion at ${new Date().toISOString()}`);

    // 1. Fetch fresh AI news from all feeds
    const articles = await fetchLiveNews();
    console.log(`[Cron 30m] Fetched ${articles.length} AI articles from feeds`);

    // 2. Batch upsert into Supabase database
    if (articles.length > 0) {
      await upsertArticles(articles);
      console.log(`[Cron 30m] Successfully synced ${articles.length} articles to Supabase`);
    }

    // 3. Revalidate homepage cache
    try {
      revalidatePath("/");
      revalidatePath("/api/news");
    } catch (revalidateErr) {
      console.error("[Cron 30m] Revalidation error:", revalidateErr);
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      articlesFetched: articles.length,
      sampleHeadlines: articles.slice(0, 3).map((a) => a.title),
      message: `Successfully refreshed AI news feed every 30 minutes. ${articles.length} articles updated.`,
    });
  } catch (error: any) {
    console.error("[Cron 30m] News sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sync AI news",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
