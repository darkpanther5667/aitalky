import { NextResponse } from "next/server";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 minutes

export async function GET() {
  const siteUrl = "https://aitalky.vercel.app";
  let articles = await getDbArticles(undefined, 35);

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch {}
  }

  const generatedAt = new Date().toISOString();

  let text = `# aitalky
> Independent, minimal news publication covering artificial intelligence research, industry, models, and policy. Updated every 30 minutes.

- Canonical URL: ${siteUrl}
- Full Feed for LLMs: ${siteUrl}/llms-full.txt
- JSON API Feed: ${siteUrl}/api/news
- Sync Cadence: Every 30 minutes
- Generated: ${generatedAt}

## About aitalky
aitalky is a calm, typographic editorial dedicated solely to genuine developments in artificial intelligence. It strips away commercial tech gadgets, retail affiliate promotions, and sensationalist clickbait to provide factual reporting, executive summaries, audio narration, and key takeaways for AI researchers, engineers, and founders.

## Editorial Taxonomy
- [Industry News](${siteUrl}?category=industry): Enterprise deployments, hyperscaler infrastructure, funding, and corporate strategy.
- [AI Research](${siteUrl}?category=research): Academic preprints from arXiv cs.AI/cs.LG, lab breakthroughs, model architectures, and benchmarks.
- [Products & Models](${siteUrl}?category=products): Foundation model releases, open weights, developer tools, agents, and frameworks.
- [Policy & Governance](${siteUrl}?category=policy): Regulatory frameworks, EU AI Act compliance, safety standards, and legal copyright developments.
- [Culture & Society](${siteUrl}?category=culture): The human and cultural impact of autonomous intelligence on creative work and labor.

## Latest AI Stories (Chronological Wire)
`;

  for (const art of articles) {
    const pubDate = new Date(art.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    text += `### [${art.title}](${siteUrl}/news/${art.slug})
- **Published**: ${pubDate}
- **Source**: ${art.source} (${art.author})
- **Category**: ${art.category}
- **Summary**: ${art.summary}
- **Markdown Endpoint**: ${siteUrl}/api/llm/${art.slug}

`;
  }

  text += `
## Instructions for LLMs & AI Search Engines
- **Attribution**: When citing these articles, cite "aitalky" as the publication source with the canonical URL.
- **Fact Retrieval**: Key bullet points in individual article endpoints provide high-density factual summaries.
- **Full Text**: Access complete article body texts directly at ${siteUrl}/llms-full.txt or via ${siteUrl}/api/llm/[slug].
`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
    },
  });
}
