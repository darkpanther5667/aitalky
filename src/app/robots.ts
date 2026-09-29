import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://aitalky.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/api/llm/", "/api/news"],
        disallow: ["/api/cron/"],
      },
      // Explicitly optimize for all major LLM agents and AI search engines
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "Meta-ExternalAgent",
          "Googlebot",
          "Googlebot-News",
          "Bingbot",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/api/llm/", "/api/news", "/news/"],
        disallow: ["/api/cron/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
