import { NextResponse } from "next/server";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = "https://aitalky.vercel.app";
  let articles = await getDbArticles(undefined, 100);

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch {}
  }

  // Filter for articles published within the last 48 hours per Google News sitemap specifications
  const now = Date.now();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;
  const recentArticles = articles.filter((art) => {
    const pubTime = new Date(art.publishedAt).getTime();
    return now - pubTime <= fortyEightHoursMs;
  });

  // If none within 48h, take the top 15 most recent
  const newsItems = recentArticles.length > 0 ? recentArticles : articles.slice(0, 15);

  const xmlUrls = newsItems
    .map((art) => {
      const pubDate = new Date(art.publishedAt).toISOString();
      return `  <url>
    <loc>${baseUrl}/news/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>aitalky</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
