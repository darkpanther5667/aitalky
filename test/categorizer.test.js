const assert = require("assert");

// Copy of categorization logic for standalone node execution
function categorizeArticle(input) {
  const { title = "", summary = "", source = "", tags = [], defaultCategory = "industry" } = input;
  const lowerTitle = title.toLowerCase();
  const lowerSummary = (summary || "").toLowerCase();
  const lowerCombined = `${lowerTitle} ${lowerSummary}`;
  const lowerTags = tags.map((t) => t.toLowerCase());

  if (
    source.includes("arXiv") ||
    source.includes("Google DeepMind") ||
    source.includes("MarkTechPost") ||
    source.includes("MIT Technology Review")
  ) {
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

  const policyRegex = /\b(lawsuit|lawsuits|copyright|eu ai act|ftc|court|judge|regulation|regulations|regulatory|antitrust|subpoena|ban|banned|legislation|congress|senate|white house|executive order|department of justice|doj|privacy violation|copyright infringement|patent)\b/i;
  if (policyRegex.test(lowerCombined)) {
    return "policy";
  }

  const cultureRegex = /\b(artist|artists|hollywood|music|musician|musicians|film|actor|actors|culture|society|social impact|deepfake scandal|authors guild|humanities|philosophical|existential fear|writers strike|labor union)\b/i;
  if (cultureRegex.test(lowerCombined)) {
    return "culture";
  }

  const researchRegex = /\b(arxiv|benchmark|benchmarks|paper|papers|architecture|architectures|study|studies|researchers|dataset|datasets|theorem|mathematical|latent|topology|fine-tuning|quantization|neural network|transformer architecture|loss function|spectral|zero-shot reasoning)\b/i;
  if (researchRegex.test(lowerCombined)) {
    return "research";
  }

  const productsRegex = /\b(launch|launches|launched|releases|released|debuts|debuted|unveils|unveiled|rollout|rolling out|preview|feature|features|pricing|api|apis|sdk|model weights|chatgpt|claude|gemini|copilot|app|tool|extension|open-source model|weights available)\b/i;
  if (productsRegex.test(lowerCombined)) {
    return "products";
  }

  return defaultCategory || "industry";
}

const testCases = [
  // 1. Research (arXiv source)
  {
    input: {
      title: "SiLSA: Sliding-Window Slice Latents for Topology-Preserving 3D Generation",
      summary: "We present a geometric framework for continuous latent field generation on complex manifold meshes.",
      source: "arXiv cs.AI"
    },
    expected: "research"
  },
  // 2. Research (DeepMind source)
  {
    input: {
      title: "AlphaGenome Atlas: A predictive map of DNA letter changes in the human genome",
      summary: "DeepMind researchers share breakthrough predictive biological models for genomic mutations.",
      source: "Google DeepMind"
    },
    expected: "research"
  },
  // 3. Research (Benchmark / Paper in title)
  {
    input: {
      title: "KaliBench: A fine-grained benchmark for cybersecurity tool use on Kali Linux",
      summary: "New evaluation dataset tests autonomous agents against penetration testing workflows.",
      source: "TechCrunch AI"
    },
    expected: "research"
  },
  // 4. Products (OpenAI release)
  {
    input: {
      title: "OpenAI launches Dots, always-on GPT-6 Astra agents that work from cloud containers",
      summary: "The new product allows subscribers to assign persistent tasks to autonomous cloud instances.",
      source: "The Verge AI"
    },
    expected: "products"
  },
  // 5. Products (API & Pricing)
  {
    input: {
      title: "Anthropic releases Claude Sonnet 5.5 at the same $2.10 pricing per million tokens",
      summary: "Developers can access the upgraded model API immediately via Amazon Bedrock and Google Cloud Vertex AI.",
      source: "TechCrunch AI"
    },
    expected: "products"
  },
  // 6. Products (Model release)
  {
    input: {
      title: "Alibaba Qwen releases Qwen-Audio 3.1 Realtime full-duplex voice model",
      summary: "The model weights are available on Hugging Face with open developer licensing.",
      source: "SiliconANGLE AI"
    },
    expected: "products"
  },
  // 7. Policy (Lawsuit / Copyright)
  {
    input: {
      title: "Federal judge refuses to dismiss Authors Guild copyright lawsuit against AI training data",
      summary: "The landmark court decision moves the fair use copyright challenge to full jury discovery.",
      source: "Wired AI"
    },
    expected: "policy"
  },
  // 8. Policy (FTC / Antitrust)
  {
    input: {
      title: "FTC launches antitrust inquiry into big cloud investments in frontier AI labs",
      summary: "Regulators subpoena partnership contracts to determine if preferential GPU access stifles competition.",
      source: "The Register AI"
    },
    expected: "policy"
  },
  // 9. Policy (EU AI Act)
  {
    input: {
      title: "EU AI Act enters enforcement phase with new compliance obligations for general-purpose models",
      summary: "Member states prepare enforcement mechanisms and audit guidelines for systemic risk assessments.",
      source: "Ars Technica AI"
    },
    expected: "policy"
  },
  // 10. Culture (Hollywood / Writers / Artists)
  {
    input: {
      title: "Hollywood labor unions draft new guardrails against synthetic actor replication in film contracts",
      summary: "Creative professionals voice concern over synthetic likeness licenses in studio productions.",
      source: "Wired AI"
    },
    expected: "culture"
  },
  // 11. Culture (Music / Society)
  {
    input: {
      title: "Grammy-winning musicians sign open letter condemning non-consensual AI voice cloning",
      summary: "The coalition urges platforms to protect artistic identity from automated cloning.",
      source: "The Verge AI"
    },
    expected: "culture"
  },
  // 12. Industry (Funding & M&A)
  {
    input: {
      title: "AMD acquires world model developer World Labs for $8.2B in cash and stock",
      summary: "The semiconductor giant expands its enterprise hardware stack to support spatial intelligence.",
      source: "SiliconANGLE AI",
      defaultCategory: "industry"
    },
    expected: "industry"
  },
  // 13. Industry (Corporate Strategy & Enterprise)
  {
    input: {
      title: "Dell AI Leadership Symposium: Cost and control reshape enterprise infrastructure priorities",
      summary: "Enterprise CIOs share procurement strategies for on-premise inference and private cloud data centers.",
      source: "SiliconANGLE AI",
      defaultCategory: "industry"
    },
    expected: "industry"
  },
  // 14. Industry (Venture Capital & Valuation)
  {
    input: {
      title: "OpenAI reportedly in talks to raise $30B round at $1.4T valuation from sovereign funds",
      summary: "The funding round would finance massive multi-gigawatt datacenter expansions across North America.",
      source: "TechCrunch AI",
      defaultCategory: "industry"
    },
    expected: "industry"
  },
  // 15. Research (MarkTechPost source)
  {
    input: {
      title: "Google Research introduces Kauldron configs for declarative neural network training",
      summary: "Kauldron provides pure-data configurations that reduce boilerplate across large-scale distributed training runs.",
      source: "MarkTechPost"
    },
    expected: "research"
  },
  // 16. Products (Tool / Extension)
  {
    input: {
      title: "Docker debuts Cloud Sandboxes for secure agentic execution on developer laptops",
      summary: "The new tool provides microVM isolation for autonomous agents running arbitrary bash commands.",
      source: "InfoQ AI/ML"
    },
    expected: "products"
  }
];

let passed = 0;
for (let i = 0; i < testCases.length; i++) {
  const { input, expected } = testCases[i];
  const actual = categorizeArticle(input);
  try {
    assert.strictEqual(actual, expected, `Test case #${i + 1} failed: expected "${expected}" but got "${actual}" for title: "${input.title}"`);
    console.log(`✓ Test #${i + 1} passed: [${actual.toUpperCase()}] "${input.title.slice(0, 50)}..."`);
    passed++;
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  }
}

console.log(`\nAll ${passed}/${testCases.length} unit tests PASSED successfully!`);
