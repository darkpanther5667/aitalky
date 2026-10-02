import { decode } from "html-entities";

/**
 * Strips HTML tags, decodes all HTML entities, and eliminates RSS boilerplate.
 */
export function cleanHtmlAndBoilerplate(rawText: string): string {
  if (!rawText) return "";

  // 1. Remove dangerous script, style, noscript tags
  let text = rawText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<[^>]+>/g, " ");

  // 2. Decode entities twice in case of double-escaped entities like &amp;#8216;
  text = decode(text);
  text = decode(text);

  // 3. Strip RSS syndication boilerplate
  text = text
    .replace(/The post\s+.+?\s+appeared first on\s+[^.]+\.?/gi, "")
    .replace(/This article originally appeared on\s+[^.]+\.?/gi, "")
    .replace(/Read more\s*(?:on|at)\s+[^.]+\.?/gi, "")
    .replace(/©\s*\d{4}\s+[^.]+\.?\s*All rights reserved\.?/gi, "")
    .replace(/Sign up for.+?newsletter\.?/gi, "")
    .replace(/Subscribe to.+?newsletter\.?/gi, "")
    .replace(/\[&#8230;\]/g, "")
    .replace(/\[\.\.\.\]/g, "")
    .replace(/\[…\]/g, "")
    .replace(/&hellip;/g, "…");

  // 4. Normalize quotes and whitespace
  text = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "—")
    .replace(/\s+/g, " ")
    .trim();

  // 5. Remove trailing dangling ellipsis or dashes
  text = text.replace(/[\s\.\-—…]+$/g, "").trim();

  return text;
}

/**
 * Cuts text cleanly at sentence or word boundary, never splitting a word in half.
 */
export function cleanExcerpt(rawText: string, maxLength: number = 280): string {
  const cleaned = cleanHtmlAndBoilerplate(rawText);
  if (!cleaned || cleaned.length <= maxLength) return cleaned;

  // Attempt to find a sentence boundary between 50% of maxLength and maxLength
  const minLength = Math.floor(maxLength * 0.55);
  const candidateSlice = cleaned.slice(0, maxLength);

  // Look for sentence terminators (. ! ?) followed by space or end
  const sentenceTerminators = [". ", "! ", "? "];
  let lastSentenceEnd = -1;

  for (const term of sentenceTerminators) {
    const idx = candidateSlice.lastIndexOf(term);
    if (idx > lastSentenceEnd) {
      lastSentenceEnd = idx;
    }
  }

  // If found clean sentence ending after minLength
  if (lastSentenceEnd >= minLength) {
    return cleaned.slice(0, lastSentenceEnd + 1).trim();
  }

  // Otherwise, find the last word boundary before maxLength
  const lastSpace = candidateSlice.lastIndexOf(" ");
  if (lastSpace > minLength) {
    return cleaned.slice(0, lastSpace).trim() + "...";
  }

  return candidateSlice.trim() + "...";
}

/**
 * Strips tracking parameters from external URLs (utm_*, ref, etc.)
 */
export function cleanUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const url = new URL(rawUrl);
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "source",
      "guccounter",
      "_hsenc",
      "_hsmi",
      "mc_cid",
      "mc_eid",
      "fbclid",
      "gclid",
    ];
    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Deterministically generates a URL-safe, clean slug.
 * Fully decodes entities first so that &#8216; or %20 never bleed into numeric characters or artifacts.
 */
export function cleanSlug(title: string): string {
  if (!title) return "";

  // 1. Decode entities
  let clean = decode(decode(title));

  // 2. Remove HTML tags if any
  clean = clean.replace(/<[^>]+>/g, "");

  // 3. Normalize apostrophes and quotes
  clean = clean
    .replace(/[\u2018\u2019']/g, "") // Remove apostrophes (e.g. don't -> dont)
    .replace(/[\u201C\u201D"]/g, "")
    .toLowerCase()
    .trim();

  // 4. Convert non-alphanumeric chars to hyphens
  clean = clean.replace(/[^a-z0-9]+/g, "-");

  // 5. Trim leading and trailing hyphens
  clean = clean.replace(/^-+|-+$/g, "");

  // 6. Max length limit at a clean word boundary
  if (clean.length > 85) {
    const truncated = clean.slice(0, 85);
    const lastHyphen = truncated.lastIndexOf("-");
    if (lastHyphen > 40) {
      clean = truncated.slice(0, lastHyphen);
    } else {
      clean = truncated;
    }
  }

  return clean;
}
