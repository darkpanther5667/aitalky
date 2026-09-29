import { XMLParser } from "fast-xml-parser";
import { Article, Category } from "@/types/news";

interface FeedSource {
  name: string;
  url: string;
  defaultCategory: Category;
  homepage: string;
  type?: "rss" | "arxiv";
}

const FEED_SOURCES: FeedSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    defaultCategory: "industry",
    homepage: "https://techcrunch.com",
    type: "rss",
  },
  {
    name: "Ars Technica AI",
    url: "https://arstechnica.com/tag/ai/feed/",
    defaultCategory: "industry",
    homepage: "https://arstechnica.com",
    type: "rss",
  },
  {
    name: "SiliconANGLE AI",
    url: "https://siliconangle.com/category/ai/feed/",
    defaultCategory: "industry",
    homepage: "https://siliconangle.com",
    type: "rss",
  },
  {
    name: "MarkTechPost",
    url: "https://www.marktechpost.com/feed/",
    defaultCategory: "research",
    homepage: "https://marktechpost.com",
    type: "rss",
  },
  {
    name: "Wired AI",
    url: "https://www.wired.com/feed/tag/ai/latest/rss",
    defaultCategory: "culture",
    homepage: "https://wired.com",
    type: "rss",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    defaultCategory: "industry",
    homepage: "https://theverge.com",
    type: "rss",
  },
  {
    name: "Hugging Face",
    url: "https://huggingface.co/blog/feed.xml",
    defaultCategory: "products",
    homepage: "https://huggingface.co",
    type: "rss",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    defaultCategory: "research",
    homepage: "https://technologyreview.com",
    type: "rss",
  },
  {
    name: "arXiv AI Research",
    url: "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=8",
    defaultCategory: "research",
    homepage: "https://arxiv.org",
    type: "arxiv",
  },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 85);
}

export function isAiRelevant(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();

  // Instant disqualification for non-AI consumer gadgets, video games, deals, retail offers
  const rejectPhrases = [
    "keyboard", "keyboards", "mouse deal", "gaming mouse", "headphone", "earbuds", "earbud",
    "soundbar", "smartwatch", "tv deal", "fire tv", "fellow stagg", "witcher", "playstation", "ps5",
    "xbox", "nintendo", "steam deck", "half off", "best deals", "discount on", "sale on", "on sale for",
    "rtx 4090 sale", "graphics card sale", "gaming laptop", "smart tv", "earbuds deal", "fire tv cube",
    "smartwatch deal", "remastered", "launch deals", "razer", "deathstalker", "logitech", "coffee maker",
    "blender", "air fryer", "vacuum", "robot vacuum", "lego", "board game", "movie trailer", "box office"
  ];

  if (rejectPhrases.some((phrase) => text.includes(phrase))) {
    return false;
  }

  // Mandatory match for authentic artificial intelligence & machine learning domains
  const aiKeywords = [
    "ai", "artificial intelligence", "machine learning", "deep learning", "neural",
    "llm", "large language model", "gpt", "claude", "deepseek", "gemini", "llama",
    "openai", "anthropic", "mistral", "hugging face", "qwen", "transformer", "reasoning",
    "agent", "agentic", "diffusion", "vision-language", "vla", "compute", "gpu",
    "nvidia", "semiconductor", "robotics", "reinforcement learning", "superintelligence",
    "agi", "deepmind", "groq", "cohere", "alignment", "safety",
    "arxiv", "synthetic data", "inference", "quantization", "fine-tuning", "parameters",
    "generative ai", "genai", "prompt", "token", "multimodal", "codex", "benchmark"
  ];

  return aiKeywords.some((kw) => {
    const rx = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    return rx.test(text);
  });
}

const CATEGORY_IMAGES: Record<Category, string[]> = {
  industry: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  ],
  research: [
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
  ],
  products: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  ],
  culture: [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80",
  ],
  policy: [
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  ],
  all: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  ],
};

function pickEditorialImage(category: Category, index: number): string {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.all;
  return list[index % list.length];
}

function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCategory(title: string, summary: string, fallback: Category): Category {
  const combined = `${title} ${summary}`.toLowerCase();
  if (combined.includes("policy") || combined.includes("regulation") || combined.includes("law") || combined.includes("eu") || combined.includes("court") || combined.includes("copyright") || combined.includes("congress")) {
    return "policy";
  }
  if (combined.includes("artist") || combined.includes("music") || combined.includes("film") || combined.includes("culture") || combined.includes("society") || combined.includes("ethic") || combined.includes("work")) {
    return "culture";
  }
  if (combined.includes("arxiv") || combined.includes("paper") || combined.includes("math") || combined.includes("benchmark") || combined.includes("study") || combined.includes("theory") || combined.includes("researcher")) {
    return "research";
  }
  if (combined.includes("tool") || combined.includes("app") || combined.includes("release") || combined.includes("feature") || combined.includes("update") || combined.includes("agent") || combined.includes("model") || combined.includes("weights")) {
    return "products";
  }
  return fallback;
}

export async function fetchLiveNews(): Promise<Article[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsedArticles: Article[] = [];

  const fetchPromises = FEED_SOURCES.map(async (source, sourceIdx) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        },
        next: { revalidate: 120 },
      });
      clearTimeout(timeout);

      if (!res.ok) return [];

      const xmlText = await res.text();
      const parsed = parser.parse(xmlText);

      // Handle arXiv
      if (source.type === "arxiv") {
        const entries = parsed?.feed?.entry
          ? Array.isArray(parsed.feed.entry)
            ? parsed.feed.entry
            : [parsed.feed.entry]
          : [];

        return entries.slice(0, 6).map((entry: any, i: number) => {
          const rawTitle = typeof entry.title === "string" ? entry.title : entry.title?.["#text"] || "";
          const cleanTitle = cleanHtml(rawTitle).replace(/^\[.*?\]\s*/, "");
          const rawSummary = entry.summary || "";
          const cleanSummary = cleanHtml(typeof rawSummary === "string" ? rawSummary : rawSummary?.["#text"] || "");

          if (!isAiRelevant(cleanTitle, cleanSummary)) {
            return null;
          }

          let authorName = "arXiv Research Team";
          if (Array.isArray(entry.author)) {
            authorName = entry.author.map((a: any) => a.name).slice(0, 2).join(", ");
          } else if (entry.author?.name) {
            authorName = entry.author.name;
          }

          const link = Array.isArray(entry.link)
            ? entry.link[0]?.["@_href"] || entry.id
            : entry.link?.["@_href"] || entry.id;

          const publishedAt = entry.published || entry.updated || new Date().toISOString();
          const slug = slugify(cleanTitle) || `arxiv-${Date.now().toString(36)}-${i}`;
          const summary = cleanSummary.slice(0, 280) + (cleanSummary.length > 280 ? "..." : "");

          return {
            id: `arxiv-${i}-${slug.slice(0, 20)}`,
            slug,
            title: cleanTitle,
            summary,
            content: cleanSummary,
            source: "arXiv cs.AI",
            sourceUrl: "https://arxiv.org",
            url: link,
            publishedAt,
            category: "research" as Category,
            readingTimeMinutes: Math.max(3, Math.ceil(cleanSummary.split(" ").length / 150)),
            author: authorName,
            authorRole: "arXiv Submission",
            imageUrl: pickEditorialImage("research", sourceIdx * 5 + i),
            tags: ["Research", "arXiv", "Machine Learning"],
          } as Article;
        }).filter(Boolean);
      }

      // Handle standard RSS feeds (TechCrunch, HuggingFace, Verge AI)
      let rawItems: any[] = [];
      if (parsed?.rss?.channel?.item) {
        rawItems = Array.isArray(parsed.rss.channel.item)
          ? parsed.rss.channel.item
          : [parsed.rss.channel.item];
      } else if (parsed?.feed?.entry) {
        rawItems = Array.isArray(parsed.feed.entry)
          ? parsed.feed.entry
          : [parsed.feed.entry];
      }

      return rawItems.slice(0, 10).map((item, idx) => {
        const rawTitle = typeof item.title === "string" ? item.title : item.title?.["#text"] || "News Update";
        const cleanTitle = cleanHtml(rawTitle).replace(/^\[.*?\]\s*/, "");
        const rawDesc = item.description || item.summary || item["content:encoded"] || item.content || "";
        const cleanDesc = cleanHtml(typeof rawDesc === "string" ? rawDesc : rawDesc?.["#text"] || "");

        // STRICT AI RELEVANCE CHECK: reject keyboards, TVs, gaming discounts, non-AI content
        if (!isAiRelevant(cleanTitle, cleanDesc)) {
          return null;
        }

        let link = item.link;
        if (typeof link === "object" && link?.["@_href"]) {
          link = link["@_href"];
        } else if (typeof link !== "string") {
          link = source.homepage;
        }

        const pubDateRaw = item.pubDate || item.published || item.updated;
        let publishedAt = new Date().toISOString();
        if (pubDateRaw) {
          const parsedDate = new Date(pubDateRaw);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.toISOString();
          }
        }

        const category = detectCategory(cleanTitle, cleanDesc, source.defaultCategory);
        const summary = cleanDesc.slice(0, 260) + (cleanDesc.length > 260 ? "..." : "");
        const readingTimeMinutes = Math.max(2, Math.ceil(cleanDesc.split(" ").length / 180));
        const slug = slugify(cleanTitle) || `news-${Date.now().toString(36)}-${idx}`;
        const author = item["dc:creator"] || item.author?.name || `${source.name} Staff`;

        return {
          id: `feed-${source.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}-${slug.slice(0, 20)}`,
          slug,
          title: cleanTitle,
          summary: summary || "Read the complete in-depth coverage on the original source publication.",
          content: cleanDesc || summary,
          source: source.name,
          sourceUrl: source.homepage,
          url: link,
          publishedAt,
          category,
          readingTimeMinutes,
          author,
          authorRole: `${source.name} Correspondent`,
          imageUrl: pickEditorialImage(category, sourceIdx * 4 + idx),
          tags: ["News", source.name, "AI"],
        } as Article;
      }).filter(Boolean);
    } catch {
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  results.forEach((res) => {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      parsedArticles.push(...res.value.filter(Boolean));
    }
  });

  // Deduplicate by normalized title & slug
  const seenSlugs = new Set<string>();
  const uniqueArticles = parsedArticles.filter((art) => {
    if (!art || !art.slug || seenSlugs.has(art.slug) || art.title.length < 10) return false;
    seenSlugs.add(art.slug);
    return true;
  });

  // Sort chronologically: freshest first
  uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return uniqueArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await fetchLiveNews();
  const matched = articles.find((a) => a.slug === slug);
  return matched || null;
}
