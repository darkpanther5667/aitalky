import { MetadataRoute } from "next";
import { fetchLiveNews } from "@/lib/rss-sources";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aitalky.news";
  const articles = await fetchLiveNews();

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
  ];

  return [...staticEntries, ...articleEntries];
}
