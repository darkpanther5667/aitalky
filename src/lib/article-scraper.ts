import { cleanHtmlAndBoilerplate } from "./text-cleaner";

interface ScrapedResult {
  content: string;
  imageUrl?: string;
  keyPoints: string[];
}

const cache = new Map<string, ScrapedResult>();

function isJunkParagraph(text: string): boolean {
  if (!text || text.length < 35) return true;

  const lower = text.toLowerCase();

  const junkPatterns = [
    /close\s+.*?\s+posts\s+from\s+this/i,
    /will\s+be\s+added\s+to\s+your\s+daily\s+email\s+digest/i,
    /posts\s+from\s+this\s+author\s+will\s+be\s+added/i,
    /vox\s+media\s+may\s+earn\s+a\s+commission/i,
    /see\s+our\s+ethics\s+statement/i,
    /follow\s+see\s+all\s+by/i,
    /part\s+of\s+the\s+.*?series/i,
    /share\s+gift\s+image/i,
    /spotted\s+launch\s+deals/i,
    /on\s+sale\s+for\s+\$/i,
    /woot\s+has\s+the/i,
    /cookie\s+policy/i,
    /privacy\s+policy/i,
    /terms\s+of\s+service/i,
    /all\s+rights\s+reserved/i,
    /subscribe\s+to\s+(?:our\s+)?newsletter/i,
    /sign\s+up\s+for/i,
    /the\s+verge\s+logo/i,
    /demo\s+your\s+breakthrough/i,
    /book\s+exhibit\s+table/i,
    /disrupt\s+ticket/i,
    /register\s+here/i,
    /save\s+up\s+to/i,
    /affiliate\s+links/i,
    /we\s+may\s+earn\s+an\s+affiliate/i,
    /photo\s+via/i,
    /photo\s+by/i,
    /image\s+credit/i,
    /getty\s+images/i,
    /shutterstock/i,
  ];

  if (junkPatterns.some((pattern) => pattern.test(lower))) {
    return true;
  }

  // Reject non-AI retail garbage
  if (
    lower.includes("keyboard") ||
    lower.includes("soundbar") ||
    lower.includes("smartwatch") ||
    lower.includes("witcher 3") ||
    lower.includes("fire tv cube")
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts real bullet points or factual key sentences from source text.
 * Never invents or appends canned templates.
 */
function extractRealKeyPoints(paragraphs: string[]): string[] {
  const candidates = paragraphs
    .filter((p) => {
      if (isJunkParagraph(p)) return false;
      if (p.length < 50 || p.length > 250) return false;
      if (!p.endsWith(".")) return false;
      return p.split(" ").length >= 8;
    })
    .slice(0, 3);

  return candidates;
}

export async function scrapeFullArticle(
  url: string,
  title: string,
  fallbackSummary: string
): Promise<ScrapedResult> {
  const cleanFallback = cleanHtmlAndBoilerplate(fallbackSummary);

  if (!url || url.startsWith("http://localhost")) {
    return {
      content: cleanFallback,
      keyPoints: [],
    };
  }

  // Check cache
  const cached = cache.get(url);
  if (cached) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // 1. Lead OpenGraph Image
    let imageUrl: string | undefined = undefined;
    const ogImageMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes("blank.gif")) {
      imageUrl = ogImageMatch[1];
    }

    // 2. Identify article body container
    let contentContainer = html;
    const containerMatch =
      html.match(/<div[^>]*class=["'][^"']*(?:wp-block-post-content|entry-content|article-content|post-content|article__content|story-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    if (containerMatch && containerMatch[1]) {
      contentContainer = containerMatch[1];
    }

    // 3. Extract text paragraphs with strict junk filtering & deduplication
    const paragraphs: string[] = [];
    const seenFingerprints = new Set<string>();
    const pMatches = contentContainer.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);

    for (const match of pMatches) {
      const rawText = match[1];
      const cleaned = cleanHtmlAndBoilerplate(rawText);

      if (isJunkParagraph(cleaned)) {
        continue;
      }

      // Deduplicate consecutive or repeating paragraphs
      const fingerprint = cleaned.toLowerCase().replace(/[^\w]/g, "").slice(0, 60);
      if (seenFingerprints.has(fingerprint)) {
        continue;
      }
      seenFingerprints.add(fingerprint);

      paragraphs.push(cleaned);
    }

    // Honest extraction: Do NOT republish full third-party articles. Keep 1-2 excerpts only, or fallback summary.
    let honestContent = "";
    if (paragraphs.length > 0) {
      honestContent = paragraphs.slice(0, 3).join("\n\n");
    } else {
      honestContent = cleanFallback;
    }

    const keyPoints = extractRealKeyPoints(paragraphs);

    const result: ScrapedResult = {
      content: honestContent,
      imageUrl,
      keyPoints,
    };

    cache.set(url, result);
    return result;
  } catch {
    const result: ScrapedResult = {
      content: cleanFallback,
      keyPoints: [],
    };
    cache.set(url, result);
    return result;
  }
}
