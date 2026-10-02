import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";
import { EditorialHomeClient } from "@/components/EditorialHomeClient";
import { Article, Category } from "@/types/news";

export const revalidate = 1800; // 30-minute ISR

const VALID_CATEGORIES: Category[] = ["industry", "research", "products", "culture", "policy"];

const CATEGORY_META: Record<
  Category,
  { title: string; description: string }
> = {
  industry: {
    title: "AI Industry & Enterprise News — aitalky",
    description: "Enterprise artificial intelligence deployments, datacenter compute economics, venture funding, and market consolidation.",
  },
  research: {
    title: "AI Research & Academic Papers — aitalky",
    description: "Frontier machine learning research, arXiv preprints, benchmark evaluations, and foundational neural architecture breakthroughs.",
  },
  products: {
    title: "AI Products, Tools & Model Releases — aitalky",
    description: "Latest weights, developer SDKs, multimodal models, agentic runtimes, and commercial AI software releases.",
  },
  culture: {
    title: "AI Culture, Ethics & Society — aitalky",
    description: "The societal consequences of artificial intelligence: creative industries, labor dynamics, philosophical dilemmas, and cultural shifts.",
  },
  policy: {
    title: "AI Policy, Law & Regulation — aitalky",
    description: "Global AI governance, EU AI Act compliance, copyright litigation, antitrust reviews, and legislative guardrails.",
  },
  all: {
    title: "All AI News & Intelligence — aitalky",
    description: "Comprehensive aggregation of global artificial intelligence developments.",
  },
};

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((cat) => ({
    category: cat,
  }));
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = category.toLowerCase() as Category;

  if (!VALID_CATEGORIES.includes(cat)) {
    return {
      title: "Category Not Found — aitalky",
    };
  }

  const meta = CATEGORY_META[cat];
  const canonicalUrl = `https://aitalky.vercel.app/category/${cat}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: "aitalky",
      images: [
        {
          url: "https://aitalky.vercel.app/og-default.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["https://aitalky.vercel.app/og-default.png"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = category.toLowerCase() as Category;

  if (!VALID_CATEGORIES.includes(cat)) {
    notFound();
  }

  let articles: Article[] = [];
  try {
    articles = await getDbArticles(cat, 35);
  } catch (err) {
    console.error(`Failed to fetch ${cat} articles from DB:`, err);
  }

  if (!articles || articles.length === 0) {
    try {
      const all = await fetchLiveNews();
      articles = all.filter((a) => a.category === cat);
    } catch (err) {
      console.error(`Failed to fetch ${cat} articles from live feed:`, err);
    }
  }

  return <EditorialHomeClient initialArticles={articles} initialCategory={cat} />;
}
