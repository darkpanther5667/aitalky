import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, fetchLiveNews } from "@/lib/rss-sources";
import { scrapeFullArticle } from "@/lib/article-scraper";
import { getDbArticleBySlug, getDbArticles, incrementArticleViews, upsertArticle } from "@/lib/db";
import { Article } from "@/types/news";
import { ArrowLeft, Clock, Calendar, ExternalLink } from "lucide-react";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import { ArticleActions } from "@/components/ArticleActions";
import { Logo } from "@/components/Logo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let article: Article | null = null;
  try {
    article = await getDbArticleBySlug(slug);
  } catch {}

  if (!article) {
    try {
      article = await getArticleBySlug(slug);
    } catch {}
  }

  if (!article) {
    return {
      title: "Story Not Found — aitalky News",
      description: "The requested news article could not be found.",
    };
  }

  const siteUrl = "https://aitalky.vercel.app";
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const ogImage = article.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  return {
    title: `${article.title} — aitalky`,
    description: article.summary,
    alternates: {
      canonical: canonicalUrl,
      types: {
        "text/markdown": `${siteUrl}/api/llm/${article.slug}`,
      },
    },
    other: {
      "citation_title": article.title,
      "citation_author": article.author,
      "citation_publication_date": article.publishedAt.slice(0, 10),
      "citation_online_date": article.publishedAt.slice(0, 10),
      "citation_journal_title": "aitalky",
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: canonicalUrl,
      siteName: "aitalky News",
      locale: "en_US",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [ogImage],
      creator: "@aitalkynews",
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Try DB first for instant sub-50ms load
  let article: Article | null = null;
  try {
    article = await getDbArticleBySlug(slug);
  } catch (err) {
    console.error("DB article fetch error:", err);
  }

  if (!article) {
    try {
      article = await getArticleBySlug(slug);
    } catch (err) {
      console.error("Live feed fetch error:", err);
    }
  }

  if (!article) {
    notFound();
  }

  // Record view count asynchronously
  incrementArticleViews(slug).catch(() => {});

  let fullBody = article.content || article.summary;
  let heroImage = article.imageUrl;
  let keyPoints = article.keyPoints || [];

  // If content is brief, enrich with scraper safely
  if (!article.content || article.content.split("\n\n").length < 3) {
    try {
      const scraped = await scrapeFullArticle(article.url, article.title, article.summary, article.category);
      if (scraped.content) {
        fullBody = scraped.content;
      }
      if (scraped.imageUrl) {
        heroImage = scraped.imageUrl;
      }
      if (scraped.keyPoints && scraped.keyPoints.length > 0) {
        keyPoints = scraped.keyPoints;
      }

      upsertArticle({
        ...article,
        content: fullBody,
        imageUrl: heroImage,
        keyPoints,
      }).catch(() => {});
    } catch (scrapeErr) {
      console.error("Article scrape error:", scrapeErr);
    }
  }

  // Fetch related articles from database first for instant performance
  let relatedArticles: Article[] = [];
  try {
    const dbArticles = await getDbArticles(article.category, 5);
    relatedArticles = dbArticles.filter((a: Article) => a.slug !== article.slug).slice(0, 3);
  } catch {}

  if (relatedArticles.length === 0) {
    try {
      const allArticles = await fetchLiveNews();
      relatedArticles = allArticles.filter((a: Article) => a.slug !== article.slug).slice(0, 3);
    } catch {}
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTimeMinutes = Math.max(2, Math.ceil(fullBody.split(" ").length / 180));

  const siteUrl = "https://aitalky.vercel.app";
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;

  // Schema.org JSON-LD NewsArticle Structured Data for Google News & LLM Citation Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [
      heroImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    ],
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": [
      {
        "@type": "Person",
        "name": article.author,
        "jobTitle": article.authorRole || `${article.source} Correspondent`,
      }
    ],
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "aitalky",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/globe.svg`
      }
    },
    "description": article.summary,
    "articleBody": fullBody,
    "isAccessibleForFree": true,
    "inLanguage": "en-US",
    "keywords": (article.tags || ["AI", "Artificial Intelligence", "Machine Learning"]).join(", "),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "articleSection": article.category,
    "wordCount": fullBody.split(" ").length,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".article-headline", ".article-takeaways"]
    }
  };

  const paragraphs = fullBody.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {/* Navigation Breadcrumb Bar */}
        <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-3.5 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
              <Logo size="sm" showSubtitle={false} />
            </div>

            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider font-semibold text-[#141413] dark:text-[#f3f3f0]">
                {article.category}
              </span>
              <span>•</span>
              <span>{readingTimeMinutes} min read</span>
            </div>
          </div>
        </header>

        {/* Main Article Container */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* Category Tag */}
          <div className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] mb-3">
            {article.category}
          </div>

          {/* Headline */}
          <h1 className="article-headline text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-[1.15] mb-4">
            {article.title}
          </h1>

          {/* Subhead / Standfirst */}
          <p className="text-base sm:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
            {article.summary}
          </p>

          {/* Byline & Metadata Box */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#e8e8e6] dark:border-[#222220] mb-8 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f4f4f2] dark:bg-[#1a1a18] flex items-center justify-center font-bold text-sm text-[#141413] dark:text-[#f3f3f0] border border-[#e8e8e6] dark:border-[#222220]">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
                  {article.author}
                </div>
                <div>{article.authorRole || `${article.source} Correspondent`}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTimeMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Client Audio Player Widget */}
          <ArticleAudioPlayer
            title={article.title}
            author={article.author}
            summary={article.summary}
            durationMinutes={readingTimeMinutes}
          />

          {/* Interactive Action Bar (Applaud, Save, Share, Ask Research Desk) */}
          <ArticleActions
            slug={article.slug}
            title={article.title}
            summary={article.summary}
            initialLikes={article.likes || 0}
          />

          {/* Featured Image */}
          {heroImage && (
            <figure className="my-8 overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18]">
              <img
                src={heroImage}
                alt={article.title}
                className="w-full max-h-[500px] object-cover"
              />
              <figcaption className="text-right text-[11px] text-[#9ca3af] p-2">
                Photo via {article.source} / Editorial Archive
              </figcaption>
            </figure>
          )}

          {/* Key Bullet Takeaways for Readers & LLMs */}
          {keyPoints && keyPoints.length > 0 && (
            <div className="article-takeaways my-8 p-6 rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] mb-3">
                Key Points
              </h2>
              <ul className="space-y-2.5 text-sm text-[#374151] dark:text-[#d1d5db]">
                {keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-black dark:text-white font-bold leading-none mt-1">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Narrative Multi-Paragraph Body */}
          <div className="article-body prose prose-neutral dark:prose-invert max-w-none font-serif text-lg sm:text-xl text-[#27272a] dark:text-[#e4e4e7] leading-relaxed space-y-6 my-8">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Original Source Reference & LLM Markdown Link */}
          <div className="mt-12 pt-6 border-t border-[#e8e8e6] dark:border-[#222220] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-3">
              <span>Published on {article.source}</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href={`/api/llm/${article.slug}`}
                target="_blank"
                rel="alternate"
                type="text/markdown"
                className="font-mono text-[11px] underline hover:text-black dark:hover:text-white"
              >
                Raw Markdown (for AI / LLMs)
              </a>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#141413] dark:text-[#f3f3f0] underline underline-offset-4 hover:opacity-80"
            >
              <span>View Original Publication</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-10 border-t border-[#e8e8e6] dark:border-[#222220]">
              <h3 className="text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-6">
                Related Stories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/news/${rel.slug}`}
                    className="group block space-y-2"
                  >
                    {rel.imageUrl && (
                      <div className="aspect-[16/10] overflow-hidden rounded bg-[#f4f4f2] dark:bg-[#1a1a18]">
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6b7280] dark:text-[#9ca3af] block">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-[#141413] dark:text-[#f3f3f0] group-hover:underline underline-offset-4 leading-snug line-clamp-2">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-[#e8e8e6] dark:border-[#222220] py-8 text-center text-xs text-[#9ca3af]">
          <Link href="/" className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0] hover:underline">
            aitalky
          </Link>
          <p className="mt-1">Independent Artificial Intelligence Journalism</p>
        </footer>
      </article>
    </>
  );
}
