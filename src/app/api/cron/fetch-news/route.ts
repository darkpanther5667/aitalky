import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNews } from "@/lib/rss-sources";
import { upsertArticles } from "@/lib/db";
import { curateAndPublishStory } from "@/lib/ai-curator";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient time for AI rewriting and RSS feeds

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

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid Bearer token or ?key= query parameter." },
      { status: 401 }
    );
  }

  try {
    console.log(`[Cron 30m AI Editor] Starting automated news discovery & editorial processing at ${new Date().toISOString()}`);

    // 1. Fetch fresh AI news across all monitored research and intelligence desks
    const articles = await fetchLiveNews();
    console.log(`[Cron 30m AI Editor] Fetched ${articles.length} AI items from feeds`);

    // 2. Run AI Senior Editor in parallel on top newest stories to synthesize executive takeaways and high-integrity prose
    const topStories = articles.slice(0, 2);
    const aiResults = await Promise.allSettled(
      topStories.map((art) =>
        curateAndPublishStory({
          title: art.title,
          summary: art.summary,
          content: art.content,
          source: art.source,
          sourceUrl: art.sourceUrl,
          url: art.url,
          publishedAt: art.publishedAt,
          imageUrl: art.imageUrl,
        })
      )
    );

    const aiProcessedTitles: string[] = [];
    aiResults.forEach((res) => {
      if (res.status === "fulfilled" && res.value) {
        aiProcessedTitles.push(res.value.title);
      }
    });

    // 3. Batch persist all articles to Supabase
    if (articles.length > 0) {
      await upsertArticles(articles);
      console.log(`[Cron 30m AI Editor] Synced ${articles.length} articles to Supabase database`);
    }

    // 4. Revalidate cache
    try {
      revalidatePath("/");
      revalidatePath("/api/news");
      revalidatePath("/llms.txt");
    } catch {}

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      articlesFetched: articles.length,
      aiEditorEnhanced: aiProcessedTitles,
      sampleHeadlines: articles.slice(0, 3).map((a) => a.title),
      message: `AI Journalist pipeline successfully discovered, edited, and published news. ${articles.length} stories updated.`,
    });
  } catch (error: any) {
    console.error("[Cron AI Editor] Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute AI news discovery and publishing",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
