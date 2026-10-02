import { Metadata } from "next";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";
import { EditorialHomeClient } from "@/components/EditorialHomeClient";
import { Article } from "@/types/news";

export const revalidate = 1800; // 30-minute ISR

export const metadata: Metadata = {
  title: "aitalky — Real-Time AI News & Research Aggregator",
  description:
    "Curated real-time coverage of artificial intelligence breakthroughs, machine learning papers, product releases, compute architecture, and governance.",
  alternates: {
    canonical: "https://aitalky.vercel.app",
  },
  openGraph: {
    title: "aitalky — Real-Time AI News & Research Aggregator",
    description:
      "Curated real-time coverage of artificial intelligence breakthroughs, machine learning papers, and frontier models.",
    url: "https://aitalky.vercel.app",
    siteName: "aitalky",
    images: [
      {
        url: "https://aitalky.vercel.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "aitalky AI News Aggregator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aitalky — Real-Time AI News & Research Aggregator",
    description: "Curated real-time coverage of artificial intelligence breakthroughs and research papers.",
    images: ["https://aitalky.vercel.app/og-default.png"],
  },
};

export default async function HomePage() {
  let articles: Article[] = [];
  try {
    articles = await getDbArticles("all", 40);
  } catch (err) {
    console.error("Failed to fetch articles from DB for SSR:", err);
  }

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch (err) {
      console.error("Failed to fetch articles from RSS for SSR:", err);
    }
  }

  return <EditorialHomeClient initialArticles={articles} />;
}
