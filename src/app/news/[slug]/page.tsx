import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, fetchLiveNews } from "@/lib/rss-sources";
import { scrapeFullArticle } from "@/lib/article-scraper";
import { getDbArticleBySlug, getDbArticles, getSlugRedirect, incrementArticleViews, upsertArticle } from "@/lib/db";
import { Article } from "@/types/news";
import { ArrowLeft, Clock, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import { ArticleActions } from "@/components/ArticleActions";
import { Logo } from "@/components/Logo";
import { EditorialFooter } from "@/components/EditorialFooter";
import { TypographicCardFallback } from "@/components/TypographicCardFallback";

export const revalidate = 1800; // 30-minute ISR

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
    const redirectSlug = await getSlugRedirect(slug);
    if (redirectSlug) {
      article = await getDbArticleBySlug(redirectSlug);
    }
  }

  if (!article) {
    return {
      title: "Story Not Found — aitalky News",
      description: "The requested news article could not be found.",
    };
  }

  const siteUrl = "https://aitalky.vercel.app";
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const ogImage = article.imageUrl ? `${siteUrl}/api/og?slug=${article.slug}` : `${siteUrl}/og-default.png`;

  return {
    title: `${article.title} — aitalky`,
    description: article.aiSummary || article.summary,
    alternates: {
      canonical: canonicalUrl,
      types: {
        "text/markdown": `${siteUrl}/api/llm/${article.slug}`,
      },
    },
    other: {
      citation_title: article.title,
      citation_author: article.author,
      citation_publication_date: article.publishedAt.slice(0, 10),
      citation_online_date: article.publishedAt.slice(0, 10),
      citation_journal_title: "aitalky",
    },
    openGraph: {
      title: article.title,
      description: article.aiSummary || article.summary,
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
      description: article.aiSummary || article.summary,
      images: [ogImage],
      creator: "@aitalkynews",
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Check for 301 slug redirect from old un-decoded entity slugs
  const redirectTarget = await getSlugRedirect(slug);
  if (redirectTarget && redirectTarget !== slug) {
    permanentRedirect(`/news/${redirectTarget}`);
  }

  // 2. Try DB first
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

  // Scrape only if content is too brief, without inventing filler
  if (!article.content || article.content.split("\n\n").length < 2) {
    try {
      const scraped = await scrapeFullArticle(article.url, article.title, article.summary);
      if (scraped.content) {
        fullBody = scraped.content;
      }
      if (scraped.imageUrl && !heroImage) {
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

  // Fetch related articles
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

  // Honest Schema.org NewsArticle or TechArticle Structured Data with isBasedOn citation
  const isResearch = article.category === "research";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isResearch ? "TechArticle" : "NewsArticle",
    headline: article.title,
    image: heroImage ? [heroImage] : [`${siteUrl}/og-default.png`],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: article.author || `${article.source} Staff`,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "aitalky",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-default.png`,
      },
    },
    description: article.aiSummary || article.summary,
    articleBody: fullBody,
    isBasedOn: article.url,
    citation: article.url,
    isAccessibleForFree: true,
    inLanguage: "en-US",
    keywords: (article.tags || ["AI", "Artificial Intelligence"]).join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: article.category,
    wordCount: fullBody.split(" ").length,
  };

  const paragraphs = fullBody.split("\n\n").filter((p) => p.trim().length > 0);

  // Honest attribution
  const hasAuthor = article.author && article.author !== article.source && !article.author.toLowerCase().includes("staff");
  const authorDisplay = hasAuthor ? `${article.author} · via ${article.source}` : `via ${article.source}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {/* Navigation Breadcrumb Bar */}
        <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-2.5 sm:py-3.5 px-3 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium p-1 sm:p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
              <Logo size="sm" showSubtitle={false} />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href={`/category/${article.category}`} className="uppercase tracking-wider font-semibold text-[#141413] dark:text-[#f3f3f0] hover:underline">
                {article.category}
              </Link>
              <span>•</span>
              <span>{readingTimeMinutes} min read</span>
            </div>
          </div>
        </header>

        {/* Main Article Container */}
        <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-14">
          {/* Category Tag */}
          <div className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] mb-2 sm:mb-3">
            <Link href={`/category/${article.category}`} className="hover:underline">
              {article.category}
            </Link>
          </div>

          {/* Headline */}
          <h1 className="article-headline text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-[1.2] sm:leading-[1.15] mb-3 sm:mb-4">
            {article.title}
          </h1>

          {/* Subhead / Standfirst */}
          <p className="text-sm sm:text-lg lg:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-4 sm:mb-6">
            {article.summary}
          </p>

          {/* Byline & Metadata Box */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#e8e8e6] dark:border-[#222220] mb-6 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f4f4f2] dark:bg-[#1a1a18] flex items-center justify-center font-bold text-sm text-[#141413] dark:text-[#f3f3f0] border border-[#e8e8e6] dark:border-[#222220]">
                {article.source.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
                  {authorDisplay}
                </div>
                <div className="text-neutral-500">Curated & Verified Aggregation</div>
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

          {/* MANDATORY PROMINENT SOURCE LINK ABOVE THE FOLD (Phase 3 Requirement 4 & 5) */}
          <div className="mb-8 p-3.5 sm:p-4 rounded-lg bg-[#f8f8f6] dark:bg-[#161614] border border-[#e5e5e2] dark:border-[#262624] flex items-center justify-between gap-4">
            <div className="text-xs sm:text-sm">
              <span className="text-[#6b7280] dark:text-[#9ca3af]">Original reporting by </span>
              <strong className="text-[#141413] dark:text-[#f3f3f0]">{article.source}</strong>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              <span>Read the full story at {article.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Multi-source coverage / Also covered by */}
          {article.alsoCoveredBy && article.alsoCoveredBy.length > 0 && (
            <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-6 p-3 rounded bg-[#f7f7f5] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">Also covered by:</span>
              {article.alsoCoveredBy.map((cov, idx) => (
                <span key={idx} className="inline-flex items-center gap-1">
                  <a
                    href={cov.url}
                    target="_blank"
                    rel="noopener nofollow"
                    className="underline hover:text-[#141413] dark:hover:text-[#f3f3f0] transition-colors"
                  >
                    {cov.source}
                  </a>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                  {idx < article.alsoCoveredBy!.length - 1 && <span className="opacity-40">·</span>}
                </span>
              ))}
            </div>
          )}

          {/* Client Audio Player Widget */}
          <ArticleAudioPlayer
            title={article.title}
            author={article.author}
            summary={article.aiSummary || article.summary}
            durationMinutes={readingTimeMinutes}
          />

          {/* Interactive Action Bar */}
          <ArticleActions
            slug={article.slug}
            title={article.title}
            summary={article.summary}
            initialLikes={article.likes || 0}
          />

          {/* AI-Assisted Grounded Summary Block */}
          {article.aiSummary && (
            <div className="my-8 p-5 sm:p-6 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Summary (AI-assisted)</span>
              </div>
              <p className="text-sm sm:text-base text-[#374151] dark:text-[#d1d5db] leading-relaxed font-sans mb-3">
                {article.aiSummary}
              </p>
              {article.whyItMatters && (
                <div className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] pt-2 border-t border-amber-500/10">
                  <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">Why it matters:</span> {article.whyItMatters}
                </div>
              )}
            </div>
          )}

          {/* Featured Image or Typographic Card */}
          {heroImage ? (
            <figure className="my-8 overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18]">
              <img
                src={heroImage}
                alt={article.title}
                className="w-full max-h-[500px] object-cover"
              />
              <figcaption className="text-right text-[11px] text-[#9ca3af] p-2">
                Image: {article.source}
              </figcaption>
            </figure>
          ) : (
            <div className="my-8">
              <TypographicCardFallback
                category={article.category}
                source={article.source}
                title={article.title}
              />
            </div>
          )}

          {/* Key Bullet Takeaways if authentic */}
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

          {/* Article Excerpt Body */}
          <div className="article-body prose prose-neutral dark:prose-invert max-w-none font-serif text-lg sm:text-xl text-[#27272a] dark:text-[#e4e4e7] leading-relaxed space-y-6 my-8">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Bottom Attribution & External Source Link */}
          <div className="mt-12 pt-6 border-t border-[#e8e8e6] dark:border-[#222220] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-3">
              <span>Reported via {article.source}</span>
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
              rel="noopener nofollow"
              className="inline-flex items-center gap-1.5 font-semibold text-[#141413] dark:text-[#f3f3f0] underline underline-offset-4 hover:opacity-80"
            >
              <span>Read the full story at {article.source} ↗</span>
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
                    {rel.imageUrl ? (
                      <div className="aspect-[16/10] overflow-hidden rounded bg-[#f4f4f2] dark:bg-[#1a1a18]">
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <TypographicCardFallback
                        category={rel.category}
                        source={rel.source}
                        title={rel.title}
                      />
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

        <EditorialFooter />
      </article>
    </>
  );
}
