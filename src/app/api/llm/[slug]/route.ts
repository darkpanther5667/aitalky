import { NextRequest, NextResponse } from "next/server";
import { getDbArticleBySlug } from "@/lib/db";
import { getArticleBySlug } from "@/lib/rss-sources";
import { scrapeFullArticle } from "@/lib/article-scraper";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  let article = await getDbArticleBySlug(slug);
  if (!article) {
    article = await getArticleBySlug(slug);
  }

  if (!article) {
    return new NextResponse("# 404 Story Not Found\nThe requested AI news story could not be found.", {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  let fullBody = article.content || article.summary;
  let keyPoints = article.keyPoints || [];

  if (!article.content || article.content.split("\n\n").length < 3) {
    try {
      const scraped = await scrapeFullArticle(article.url, article.title, article.summary, article.category);
      if (scraped.content) fullBody = scraped.content;
      if (scraped.keyPoints && scraped.keyPoints.length > 0) keyPoints = scraped.keyPoints;
    } catch {}
  }

  const siteUrl = "https://aitalky.vercel.app";
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const pubDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const markdown = `# ${article.title}

> **Publication**: aitalky (Independent AI Journalism)
> **Canonical Citation URL**: ${canonicalUrl}
> **Original Source**: [${article.source}](${article.url})
> **Author**: ${article.author} (${article.authorRole})
> **Published Date**: ${pubDate}
> **Category**: ${article.category.toUpperCase()}
> **Tags**: ${(article.tags || []).join(", ")}

## Executive Summary
${article.summary}

${
  keyPoints.length > 0
    ? `## Key Takeaways
${keyPoints.map((pt) => `- ${pt}`).join("\n")}
`
    : ""
}

## Full Coverage
${fullBody}

---
*Generated for AI agents and LLM citation by aitalky (https://aitalky.vercel.app).*
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
