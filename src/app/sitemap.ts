import { MetadataRoute } from "next";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";
import { AI_MODELS } from "@/lib/models-data";
import { POPULAR_COMPARISONS } from "@/lib/benchmarks-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aitalky.vercel.app";
  let articles = await getDbArticles(undefined, 250);

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

  const categoryEntries: MetadataRoute.Sitemap = [
    "industry",
    "research",
    "products",
    "culture",
    "policy",
  ].map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.85,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/brief`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/models/compare`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const modelEntries: MetadataRoute.Sitemap = AI_MODELS.map((m) => ({
    url: `${baseUrl}/models/${m.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const comparisonEntries: MetadataRoute.Sitemap = POPULAR_COMPARISONS.map((c) => ({
    url: `${baseUrl}/models/compare/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticEntries, ...categoryEntries, ...modelEntries, ...comparisonEntries, ...articleEntries];
}
