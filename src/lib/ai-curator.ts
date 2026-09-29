import { Article, Category } from "@/types/news";
import { getDbArticleBySlug, upsertArticle } from "@/lib/db";
import { slugify } from "@/lib/rss-sources";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface EditorialGenerationResult {
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  category: Category;
  tags: string[];
  readingTimeMinutes: number;
}

/**
 * Transforms raw news into an original, high-integrity aitalky editorial article using Gemini AI.
 */
export async function transformWithAi(raw: {
  title: string;
  summary: string;
  content?: string;
  source: string;
  url: string;
}): Promise<EditorialGenerationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey || apiKey.startsWith("AQ.")) {
    // If no valid Gemini AI key is present, fallback to smart structured synthesis
    return fallbackEditorialSynthesizer(raw);
  }

  const prompt = `You are the Senior Editor of 'aitalky' (https://aitalky.vercel.app), a prestigious, calm, and intellectually rigorous publication dedicated purely to Artificial Intelligence.

Your job is to rewrite this raw story into an original, publication-ready editorial piece.

EDITORIAL GUIDELINES:
1. Tone: Calm, thoughtful, deeply analytical, and human.
2. Voice: High journalistic standards (like MIT Technology Review or Financial Times AI).
3. Strictly forbidden: Do NOT use sensationalist tropes ("game changer", "revolutionary", "skyrocketing", "unleashes"), robotic clichés ("in a world of AI", "dive into"), or emojis.
4. Focus: Emphasize practical implications, algorithmic details, compute economics, or regulatory impacts.

RAW STORY INPUT:
Title: ${raw.title}
Source: ${raw.source}
URL: ${raw.url}
Details: ${raw.content || raw.summary}

RESPONSE FORMAT:
Respond with ONLY valid JSON (no markdown formatting, no code blocks):
{
  "title": "Compelling, clear editorial headline (max 85 chars)",
  "summary": "Crisp 2-sentence executive standfirst summarizing the news fact and its broader consequence.",
  "content": "Full narrative article body composed of 3 to 4 well-structured paragraphs separated by double newlines. Rich in context and factual clarity.",
  "keyPoints": [
    "High-density bullet point 1 (factual takeaway)",
    "High-density bullet point 2 (architectural or business impact)",
    "High-density bullet point 3 (industry or research context)"
  ],
  "category": "industry" | "research" | "products" | "policy" | "culture",
  "tags": ["AI", "ModelName/Company", "SpecificTopic"],
  "readingTimeMinutes": 3
}`;

  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title || raw.title,
        summary: parsed.summary || raw.summary,
        content: parsed.content || raw.content || raw.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        category: (parsed.category as Category) || "industry",
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["AI", raw.source],
        readingTimeMinutes: parsed.readingTimeMinutes || 3,
      };
    } catch {
      continue;
    }
  }

  return fallbackEditorialSynthesizer(raw);
}

/**
 * Deterministic fallback synthesizer if AI API key is temporarily unavailable.
 */
function fallbackEditorialSynthesizer(raw: {
  title: string;
  summary: string;
  content?: string;
  source: string;
}): EditorialGenerationResult {
  const text = raw.content || raw.summary;
  const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.length > 20);

  const keyPoints: string[] = [];
  if (sentences.length >= 3) {
    keyPoints.push(sentences[0]);
    keyPoints.push(sentences[1]);
    keyPoints.push(`Primary reporting and verification verified by ${raw.source}.`);
  } else {
    keyPoints.push(raw.summary);
    keyPoints.push(`Continuous tracking provided via ${raw.source} intelligence feeds.`);
  }

  let category: Category = "industry";
  const lower = (raw.title + " " + raw.summary).toLowerCase();
  if (lower.includes("paper") || lower.includes("arxiv") || lower.includes("research")) category = "research";
  else if (lower.includes("policy") || lower.includes("law") || lower.includes("court") || lower.includes("act")) category = "policy";
  else if (lower.includes("release") || lower.includes("tool") || lower.includes("app") || lower.includes("weights")) category = "products";
  else if (lower.includes("human") || lower.includes("artist") || lower.includes("work") || lower.includes("ethic")) category = "culture";

  return {
    title: raw.title,
    summary: raw.summary,
    content: raw.content || raw.summary,
    keyPoints,
    category,
    tags: ["AI", raw.source, category],
    readingTimeMinutes: Math.max(2, Math.ceil(text.split(" ").length / 160)),
  };
}

/**
 * Autonomously curates, rewrites, and publishes a new story to Supabase.
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
  const slug = slugify(rawStory.title);
  if (!slug) return null;

  // Check if already in Supabase
  const existing = await getDbArticleBySlug(slug);
  if (existing && existing.content && existing.content.length > 200) {
    return existing;
  }

  // Transform using AI
  const transformed = await transformWithAi(rawStory);
  if (!transformed) return null;

  const article: Article = {
    id: `ai-${Date.now().toString(36)}-${slug.slice(0, 16)}`,
    slug,
    title: transformed.title,
    summary: transformed.summary,
    content: transformed.content,
    source: rawStory.source,
    sourceUrl: rawStory.sourceUrl || "https://aitalky.vercel.app",
    url: rawStory.url,
    publishedAt: rawStory.publishedAt || new Date().toISOString(),
    category: transformed.category,
    readingTimeMinutes: transformed.readingTimeMinutes,
    author: `${rawStory.source} Desk / aitalky AI Review`,
    authorRole: "Editorial Intelligence",
    imageUrl:
      rawStory.imageUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: transformed.tags,
    keyPoints: transformed.keyPoints,
  };

  // Upsert to Supabase
  await upsertArticle(article);
  return article;
}
