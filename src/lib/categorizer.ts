import { Category } from "@/types/news";

interface CategorizationInput {
  title: string;
  summary?: string;
  source?: string;
  tags?: string[];
  defaultCategory?: Category;
}

/**
 * Deterministically categorizes an AI news article based on source authority,
 * explicit feed tags, and high-precision domain keywords.
 */
export function categorizeArticle(input: CategorizationInput): Category {
  const { title = "", summary = "", source = "", tags = [], defaultCategory = "industry" } = input;
  const lowerTitle = title.toLowerCase();
  const lowerSummary = (summary || "").toLowerCase();
  const lowerCombined = `${lowerTitle} ${lowerSummary}`;
  const lowerTags = tags.map((t) => t.toLowerCase());

  // 1. Source-level deterministic rules
  if (
    source.includes("arXiv") ||
    source.includes("Google DeepMind") ||
    source.includes("MarkTechPost") ||
    source.includes("MIT Technology Review")
  ) {
    // Unless explicitly about a lawsuit/regulation
    if (
      lowerTitle.includes("lawsuit") ||
      lowerTitle.includes("court") ||
      lowerTitle.includes("regulation") ||
      lowerTitle.includes("ban")
    ) {
      return "policy";
    }
    return "research";
  }

  // 2. Explicit RSS Tags if provided
  for (const tag of lowerTags) {
    if (tag.includes("policy") || tag.includes("legal") || tag.includes("regulation") || tag.includes("law")) {
      return "policy";
    }
    if (tag.includes("research") || tag.includes("paper") || tag.includes("academic") || tag.includes("study")) {
      return "research";
    }
    if (tag.includes("product") || tag.includes("release") || tag.includes("hardware") || tag.includes("software")) {
      return "products";
    }
    if (tag.includes("culture") || tag.includes("society") || tag.includes("art") || tag.includes("ethics")) {
      return "culture";
    }
  }

  // 3. Keyword Rules with strict precedence
  // Priority 1: Policy / Legal / Regulation / Antitrust
  const policyRegex = /\b(lawsuit|lawsuits|copyright|eu ai act|ftc|court|judge|regulation|regulations|regulatory|antitrust|subpoena|ban|banned|legislation|congress|senate|white house|executive order|department of justice|doj|privacy violation|copyright infringement|patent)\b/i;
  if (policyRegex.test(lowerCombined)) {
    return "policy";
  }

  // Priority 2: Culture / Human Impact / Ethics / Arts
  const cultureRegex = /\b(artist|artists|hollywood|music|musician|musicians|film|actor|actors|culture|society|social impact|deepfake scandal|authors guild|humanities|philosophical|existential fear|writers strike|labor union)\b/i;
  if (cultureRegex.test(lowerCombined)) {
    return "culture";
  }

  // Priority 3: Research / Benchmark / Architecture / Theory
  const researchRegex = /\b(arxiv|benchmark|benchmarks|paper|papers|architecture|architectures|study|studies|researchers|dataset|datasets|theorem|mathematical|latent|topology|fine-tuning|quantization|neural network|transformer architecture|loss function|spectral|zero-shot reasoning)\b/i;
  if (researchRegex.test(lowerCombined)) {
    return "research";
  }

  // Priority 4: Products / Releases / Tools / APIs
  const productsRegex = /\b(launch|launches|launched|releases|released|debuts|debuted|unveils|unveiled|rollout|rolling out|preview|feature|features|pricing|api|apis|sdk|model weights|chatgpt|claude|gemini|copilot|app|tool|extension|open-source model|weights available)\b/i;
  if (productsRegex.test(lowerCombined)) {
    return "products";
  }

  // 4. Fallback to source's primary topic or industry
  return defaultCategory || "industry";
}
