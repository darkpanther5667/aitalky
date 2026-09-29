import { MetadataRoute } from "next";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aitalky.vercel.app";
  let articles = await getDbArticles(undefined, 200);

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch {}
  }

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  return [...staticEntries, ...articleEntries];
}
