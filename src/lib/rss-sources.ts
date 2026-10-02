import { XMLParser } from "fast-xml-parser";
import { Article, Category, AlsoCoveredBy } from "@/types/news";
import { cleanHtmlAndBoilerplate, cleanExcerpt, cleanUrl, cleanSlug } from "./text-cleaner";
import { categorizeArticle } from "./categorizer";

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
    name: "Hugging Face",
    url: "https://huggingface.co/blog/feed.xml",
    defaultCategory: "products",
    homepage: "https://huggingface.co",
    type: "rss",
  },
  {
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/rss.xml",
    defaultCategory: "research",
    homepage: "https://deepmind.google",
    type: "rss",
  },
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    defaultCategory: "products",
    homepage: "https://openai.com",
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
    name: "AWS ML Blog",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
    defaultCategory: "industry",
    homepage: "https://aws.amazon.com",
    type: "rss",
  },
  {
    name: "NVIDIA Blog",
    url: "https://blogs.nvidia.com/feed/",
    defaultCategory: "industry",
    homepage: "https://blogs.nvidia.com",
    type: "rss",
  },
  {
    name: "InfoQ AI/ML",
    url: "https://feed.infoq.com/ai-ml-data-eng/news",
    defaultCategory: "industry",
    homepage: "https://www.infoq.com",
    type: "rss",
  },
  {
    name: "The Register AI",
    url: "https://www.theregister.com/software/ai_ml/headlines.atom",
    defaultCategory: "policy",
    homepage: "https://www.theregister.com",
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
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    defaultCategory: "research",
    homepage: "https://technologyreview.com",
    type: "rss",
  },
  {
    name: "arXiv AI Research",
    url: "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=10",
    defaultCategory: "research",
    homepage: "https://arxiv.org",
    type: "arxiv",
  },
];

export { cleanSlug as slugify };

export function isAiRelevant(title: string, summary: string, sourceName?: string): boolean {
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

  // Pure AI-dedicated research desks are intrinsically relevant unless flagged by consumer reject phrases
  const dedicatedAiDesks = [
    "Hugging Face", "arXiv AI Research", "MarkTechPost", "Google DeepMind",
    "OpenAI News", "AWS ML Blog", "NVIDIA Blog", "MIT Technology Review",
    "SiliconANGLE AI", "TechCrunch AI", "Ars Technica AI", "The Verge AI",
    "Wired AI", "InfoQ AI/ML", "The Register AI"
  ];

  if (sourceName && dedicatedAiDesks.includes(sourceName)) {
    return true;
  }

  // Mandatory match for authentic artificial intelligence & machine learning domains
  const aiKeywords = [
    "ai", "artificial intelligence", "machine learning", "deep learning", "neural",
    "llm", "llms", "large language model", "large language models", "gpt", "claude", "deepseek", "gemini", "llama",
    "openai", "anthropic", "mistral", "hugging face", "qwen", "transformer", "transformers", "reasoning",
    "agent", "agents", "agentic", "diffusion", "vision-language", "vla", "compute", "gpu", "gpus",
    "nvidia", "semiconductor", "semiconductors", "chip", "chips", "robotics", "robot", "robots",
    "reinforcement learning", "superintelligence", "agi", "deepmind", "groq", "cohere", "alignment", "safety",
    "arxiv", "synthetic data", "inference", "quantization", "fine-tuning", "parameters",
    "generative ai", "genai", "prompt", "prompts", "token", "tokens", "multimodal", "codex", "benchmark", "benchmarks"
  ];

  return aiKeywords.some((kw) => {
    const rx = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    return rx.test(text);
  });
}

/**
 * Extracts authentic image from RSS item enclosures, media tags, or inline HTML.
 * Never assigns synthetic stock photos.
 */
function extractAuthenticImage(item: any, rawHtml: string = ""): string | undefined {
  // 1. Enclosure tag
  if (item.enclosure) {
    const enc = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
    const url = enc?.["@_url"] || enc?.url;
    const type = enc?.["@_type"] || enc?.type || "";
    if (url && (type.startsWith("image/") || /\.(jpe?g|png|webp|avif)/i.test(url))) {
      return url;
    }
  }

  // 2. Media:content
  if (item["media:content"]) {
    const media = Array.isArray(item["media:content"]) ? item["media:content"][0] : item["media:content"];
    const url = media?.["@_url"] || media?.url;
    if (url && !url.includes("blank.gif") && !url.includes("1x1")) {
      return url;
    }
  }

  // 3. Media:thumbnail
  if (item["media:thumbnail"]) {
    const thumb = Array.isArray(item["media:thumbnail"]) ? item["media:thumbnail"][0] : item["media:thumbnail"];
    const url = thumb?.["@_url"] || thumb?.url;
    if (url && !url.includes("blank.gif")) {
      return url;
    }
  }

  // 4. iTunes image
  if (item["itunes:image"]) {
    const itunes = item["itunes:image"];
    const url = itunes?.["@_href"] || itunes?.href;
    if (url) return url;
  }

  // 5. Parse inline <img> from HTML description if present
  if (rawHtml) {
    const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes("tracking") && !imgMatch[1].includes("1x1")) {
      return imgMatch[1];
    }
  }

  return undefined;
}

/**
 * Extracts significant tokens for title clustering.
 */
function getTitleTokens(title: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "is", "in", "to", "for", "of", "and", "on", "with", "as", "at", "by", "that", "this", "from",
    "its", "it", "are", "be", "has", "have", "had", "will", "how", "what", "why", "when", "where", "who", "all",
    "new", "more", "first", "says", "said", "over", "into", "about", "after"
  ]);
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return new Set(words);
}

function calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deduplicates and clusters stories covering the same news event into primary cards + alsoCoveredBy links.
 */
export function deduplicateAndClusterArticles(articles: Article[]): Article[] {
  const clusters: Article[] = [];

  for (const current of articles) {
    const currentTokens = getTitleTokens(current.title);
    const currentTime = new Date(current.publishedAt).getTime();

    // Check if current matches an existing cluster within 12 hours
    let matchedCluster: Article | null = null;
    for (const primary of clusters) {
      const primaryTime = new Date(primary.publishedAt).getTime();
      const timeDiffHours = Math.abs(currentTime - primaryTime) / (1000 * 60 * 60);

      if (timeDiffHours <= 12) {
        const primaryTokens = getTitleTokens(primary.title);
        const sim = calculateSimilarity(currentTokens, primaryTokens);
        if (sim >= 0.45) {
          matchedCluster = primary;
          break;
        }
      }
    }

    if (matchedCluster) {
      // Avoid duplicate source links in alsoCoveredBy
      if (!matchedCluster.alsoCoveredBy) {
        matchedCluster.alsoCoveredBy = [];
      }
      if (
        matchedCluster.source !== current.source &&
        !matchedCluster.alsoCoveredBy.some((cov) => cov.source === current.source)
      ) {
        matchedCluster.alsoCoveredBy.push({
          source: current.source,
          url: current.url,
          title: current.title,
        });
      }
    } else {
      clusters.push({ ...current, alsoCoveredBy: current.alsoCoveredBy || [] });
    }
  }

  return clusters;
}

export async function fetchLiveNews(): Promise<Article[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsedArticles: Article[] = [];

  const fetchPromises = FEED_SOURCES.map(async (source) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);

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

        return entries.slice(0, 8).map((entry: any, i: number) => {
          const rawTitle = typeof entry.title === "string" ? entry.title : entry.title?.["#text"] || entry.title?.["@_text"] || "";
          const cleanTitle = cleanHtmlAndBoilerplate(rawTitle).replace(/^\[.*?\]\s*/, "");
          const rawSummary = entry.summary || "";
          const cleanSummary = cleanHtmlAndBoilerplate(typeof rawSummary === "string" ? rawSummary : rawSummary?.["#text"] || "");

          if (!isAiRelevant(cleanTitle, cleanSummary, source.name)) {
            return null;
          }

          let authorName = "arXiv Research Team";
          if (Array.isArray(entry.author)) {
            authorName = entry.author.map((a: any) => a.name).slice(0, 2).join(", ");
          } else if (entry.author?.name) {
            authorName = entry.author.name;
          }
          authorName = cleanHtmlAndBoilerplate(authorName);

          let link = entry.link;
          if (Array.isArray(link)) {
            const alt = link.find((l: any) => l["@_rel"] === "alternate" || !l["@_rel"]);
            link = alt?.["@_href"] || link[0]?.["@_href"] || entry.id;
          } else if (typeof link === "object" && link?.["@_href"]) {
            link = link["@_href"];
          } else if (typeof link !== "string") {
            link = entry.id || source.homepage;
          }
          link = cleanUrl(link);

          const publishedAt = entry.published || entry.updated || new Date().toISOString();
          const slug = cleanSlug(cleanTitle) || `arxiv-${Date.now().toString(36)}-${i}`;
          const summary = cleanExcerpt(cleanSummary, 280);

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
            imageUrl: undefined, // No fake stock photos
            tags: ["Research", "arXiv", "Machine Learning"],
          } as Article;
        }).filter(Boolean);
      }

      // Handle standard RSS & Atom feeds
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
        const rawTitle = typeof item.title === "string" ? item.title : item.title?.["#text"] || item.title?.["@_text"] || item.title?.text || "News Update";
        const cleanTitle = cleanHtmlAndBoilerplate(rawTitle).replace(/^\[.*?\]\s*/, "");
        const rawDesc = item.description || item.summary || item["content:encoded"] || item.content || "";
        const rawDescString = typeof rawDesc === "string" ? rawDesc : rawDesc?.["#text"] || rawDesc?.["@_text"] || "";
        const cleanDesc = cleanHtmlAndBoilerplate(rawDescString);

        if (!isAiRelevant(cleanTitle, cleanDesc, source.name)) {
          return null;
        }

        let link = item.link;
        if (Array.isArray(link)) {
          const alt = link.find((l: any) => l["@_rel"] === "alternate" || !l["@_rel"]);
          link = alt?.["@_href"] || link[0]?.["@_href"] || source.homepage;
        } else if (typeof link === "object" && link?.["@_href"]) {
          link = link["@_href"];
        } else if (typeof link !== "string") {
          link = source.homepage;
        }
        link = cleanUrl(link);

        const pubDateRaw = item.pubDate || item.published || item.updated;
        let publishedAt = new Date().toISOString();
        if (pubDateRaw) {
          const parsedDate = new Date(pubDateRaw);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.toISOString();
          }
        }

        const summary = cleanExcerpt(cleanDesc, 260) || cleanTitle;
        const category = categorizeArticle({
          title: cleanTitle,
          summary: cleanDesc,
          source: source.name,
          defaultCategory: source.defaultCategory,
        });

        const readingTimeMinutes = Math.max(2, Math.ceil(cleanDesc.split(" ").length / 180));
        const slug = cleanSlug(cleanTitle) || `news-${Date.now().toString(36)}-${idx}`;
        const rawAuthor = item["dc:creator"] || item.author?.name || `${source.name} Staff`;
        const author = cleanHtmlAndBoilerplate(rawAuthor);

        const imageUrl = extractAuthenticImage(item, rawDescString);

        return {
          id: `feed-${source.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}-${slug.slice(0, 20)}`,
          slug,
          title: cleanTitle,
          summary,
          content: cleanDesc || summary,
          source: source.name,
          sourceUrl: source.homepage,
          url: link,
          publishedAt,
          category,
          readingTimeMinutes,
          author,
          imageUrl, // authentic image or undefined
          tags: ["AI", source.name, category],
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

  // Deduplicate and cluster multi-source coverage
  const uniqueArticles = deduplicateAndClusterArticles(parsedArticles);

  // Sort chronologically: freshest first
  uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return uniqueArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await fetchLiveNews();
  const matched = articles.find((a) => a.slug === slug);
  return matched || null;
}
