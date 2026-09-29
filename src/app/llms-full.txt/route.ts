import { NextResponse } from "next/server";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const siteUrl = "https://aitalky.vercel.app";
  let articles = await getDbArticles(undefined, 20);

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch {}
  }

  let text = `# aitalky — Complete Knowledge Base & Story Corpus for LLMs
> Generated: ${new Date().toISOString()}
> Publication: aitalky (https://aitalky.vercel.app)
> Scope: Pure Artificial Intelligence News, Preprints, Analysis

---
`;

  for (const art of articles) {
    const pubDate = new Date(art.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    text += `## Story: ${art.title}
- **URL**: ${siteUrl}/news/${art.slug}
- **Original Source**: ${art.source} (${art.url})
- **Author**: ${art.author} (${art.authorRole})
- **Date**: ${pubDate}
- **Category**: ${art.category}
- **Tags**: ${(art.tags || []).join(", ")}

### Summary
${art.summary}

### Key Points
${(art.keyPoints || []).map((pt) => `- ${pt}`).join("\n") || "- Factual coverage of recent advancements in artificial intelligence models and industry developments."}

### Full Article Body
${art.content || art.summary}

---
`;
  }

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
    },
  });
}
