import { Article, Category } from "@/types/news";
import { getDbArticleBySlug, upsertArticle } from "@/lib/db";
import { cleanSlug, cleanHtmlAndBoilerplate } from "./text-cleaner";
import { categorizeArticle } from "./categorizer";

const summaryCache = new Map<string, { aiSummary: string; whyItMatters: string }>();

export interface GroundedSummaryResult {
  aiSummary: string;
  whyItMatters: string;
}

/**
 * Generates a grounded 2-3 sentence factual summary and 1-line "Why it matters".
 * Strictly constrained to facts provided in the source text.
 * Skips generation if source text is under 30 words.
 */
export async function generateGroundedSummary(story: {
  id?: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
}): Promise<GroundedSummaryResult | null> {
  const cacheKey = story.id || story.title;
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey)!;
  }

  const rawText = `${story.summary} ${story.content || ""}`.trim();
  const cleanedText = cleanHtmlAndBoilerplate(rawText);
  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

  // Grounding Rule: If source text is under 30 words, do not generate AI summary
  if (wordCount < 30) {
    return null;
  }

  const prompt = `You are a rigorous, strictly factual editorial assistant for an AI news aggregator.
Your task is to summarize the following news story using ONLY the facts explicitly provided in the source text below.

STRICT GROUNDING RULES:
1. Do NOT invent, assume, or extrapolate any facts, quotes, statistics, job titles, or dates not explicitly stated in the source text.
2. If a detail is not in the text, do not mention it.
3. Write a concise 2 to 3 sentence summary of the news fact.
4. Write exactly 1 sentence under "whyItMatters" describing the direct technical or industry significance explicitly supported by the text.
5. Tone: Neutral, factual, and informative. No marketing hype ("game changer", "revolutionary").

SOURCE TEXT:
Headline: ${story.title}
Source: ${story.source}
Details: ${cleanedText.slice(0, 1500)}

RESPONSE FORMAT (Respond with ONLY valid JSON, no markdown formatting):
{
  "summary": "2 to 3 sentence strictly grounded summary.",
  "whyItMatters": "1 sentence explaining practical significance."
}`;

  // Generate grounded summary using Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return null;
  }

  const candidateModels = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
  ];

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    try {
      let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 350,
          },
        }),
      });

      // Handle 429 rate limit or 503 high demand with a quick backoff
      if (res.status === 429 || res.status === 503) {
        await new Promise((r) => setTimeout(r, 1200));
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 350,
            },
          }),
        });
      }

      if (res.ok) {
        const json = await res.json();
        const rawOutput = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(rawOutput.replace(/```json\n?|\n?```/g, "").trim());
        if (parsed.summary && parsed.whyItMatters) {
          const result: GroundedSummaryResult = {
            aiSummary: parsed.summary.trim(),
            whyItMatters: parsed.whyItMatters.trim(),
          };
          summaryCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // try next Gemini model
    }
  }

  return null;
}

/**
 * Enriches and saves an article with grounded AI summary if needed.
 */
export async function curateAndPublishStory(rawStory: {
  title: string;
  summary: string;
  content?: string;
  source: string;
  sourceUrl?: string;
  url: string;
  publishedAt?: string;
  imageUrl?: string;
}): Promise<Article | null> {
  const cleanTitle = cleanHtmlAndBoilerplate(rawStory.title);
  const slug = cleanSlug(cleanTitle);
  if (!slug) return null;

  const existing = await getDbArticleBySlug(slug);
  if (existing && existing.aiSummary) {
    return existing;
  }

  const category = categorizeArticle({
    title: cleanTitle,
    summary: rawStory.summary,
    source: rawStory.source,
  });

  const grounded = await generateGroundedSummary({
    id: existing?.id,
    title: cleanTitle,
    summary: rawStory.summary,
    content: rawStory.content,
    source: rawStory.source,
  });

  const article: Article = {
    id: existing?.id || `story-${Date.now().toString(36)}-${slug.slice(0, 16)}`,
    slug,
    title: cleanTitle,
    summary: existing?.summary || cleanHtmlAndBoilerplate(rawStory.summary),
    content: existing?.content || cleanHtmlAndBoilerplate(rawStory.content || rawStory.summary),
    source: rawStory.source,
    sourceUrl: rawStory.sourceUrl || "https://aitalky.vercel.app",
    url: rawStory.url,
    publishedAt: rawStory.publishedAt || existing?.publishedAt || new Date().toISOString(),
    category,
    readingTimeMinutes: Math.max(2, Math.ceil((rawStory.content || rawStory.summary).split(" ").length / 160)),
    author: existing?.author || `${rawStory.source} Staff`,
    imageUrl: rawStory.imageUrl || existing?.imageUrl || undefined,
    tags: ["AI", rawStory.source, category],
    keyPoints: existing?.keyPoints || [],
    aiSummary: grounded?.aiSummary || existing?.aiSummary,
    whyItMatters: grounded?.whyItMatters || existing?.whyItMatters,
    isAiSummary: Boolean(grounded?.aiSummary || existing?.aiSummary),
  };

  await upsertArticle(article);
  return article;
}
