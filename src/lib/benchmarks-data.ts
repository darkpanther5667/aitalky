export interface BenchmarkMeta {
  id: string;
  name: string;
  category: "Math & Logic" | "PhD Science" | "General Reasoning" | "Real-world Coding" | "Code Generation";
  description: string;
  metric: string; // e.g. "% Accuracy", "% Pass@1"
}

export const BENCHMARKS: Record<string, BenchmarkMeta> = {
  math500: {
    id: "math500",
    name: "MATH 500",
    category: "Math & Logic",
    description: "Challenging competition-level high school and undergraduate mathematics problems evaluating step-by-step analytical proof capability.",
    metric: "% Accuracy",
  },
  gpqa: {
    id: "gpqa",
    name: "GPQA Diamond",
    category: "PhD Science",
    description: "Google-proof PhD-level multiple-choice questions in biology, physics, and chemistry designed by domain experts.",
    metric: "% Accuracy",
  },
  mmlu_pro: {
    id: "mmlu_pro",
    name: "MMLU-Pro",
    category: "General Reasoning",
    description: "Expanded reasoning benchmark with 12,000+ challenging multi-step questions across 14 academic and professional subjects.",
    metric: "% Accuracy",
  },
  swe_bench: {
    id: "swe_bench",
    name: "SWE-bench Verified",
    category: "Real-world Coding",
    description: "Human-verified subset of real-world GitHub issues evaluating autonomous agent capability to debug and resolve real open-source bugs.",
    metric: "% Resolved",
  },
  humaneval: {
    id: "humaneval",
    name: "HumanEval",
    category: "Code Generation",
    description: "Standard benchmark testing zero-shot Python function generation against functional unit test suites.",
    metric: "% Pass@1",
  },
};

export interface ModelBenchmarkScore {
  modelId: string;
  scores: {
    math500?: number;
    gpqa?: number;
    mmlu_pro?: number;
    swe_bench?: number;
    humaneval?: number;
  };
  notes?: string;
}

export const MODEL_BENCHMARKS: Record<string, ModelBenchmarkScore> = {
  "deepseek-r1": {
    modelId: "deepseek-r1",
    scores: {
      math500: 97.3,
      gpqa: 71.5,
      mmlu_pro: 84.0,
      swe_bench: 49.2,
      humaneval: 96.1,
    },
    notes: "DeepSeek-R1 Technical Report (Jan 2025). Large-scale reinforcement learning reasoning mode.",
  },
  "openai-o1": {
    modelId: "openai-o1",
    scores: {
      math500: 96.4,
      gpqa: 77.3,
      mmlu_pro: 83.3,
      swe_bench: 48.9,
      humaneval: 92.4,
    },
    notes: "OpenAI o1 System Card (Dec 2024). Test-time compute scaling on STEM reasoning.",
  },
  "openai-o3-mini": {
    modelId: "openai-o3-mini",
    scores: {
      math500: 97.9,
      gpqa: 79.7,
      mmlu_pro: 81.2,
      swe_bench: 49.3,
      humaneval: 94.0,
    },
    notes: "OpenAI o3-mini Announcement (Jan 2025). High reasoning effort configuration.",
  },
  "claude-3-5-sonnet": {
    modelId: "claude-3-5-sonnet",
    scores: {
      math500: 78.3,
      gpqa: 65.0,
      mmlu_pro: 78.0,
      swe_bench: 49.0,
      humaneval: 93.7,
    },
    notes: "Anthropic Claude 3.5 Sonnet Upgraded Report (Oct 2024). Industry leader in software engineering.",
  },
  "claude-3-5-haiku": {
    modelId: "claude-3-5-haiku",
    scores: {
      math500: 69.2,
      gpqa: 55.8,
      mmlu_pro: 69.4,
      swe_bench: 40.6,
      humaneval: 88.9,
    },
    notes: "Anthropic Claude 3.5 Haiku System Card (Nov 2024).",
  },
  "gemini-2-0-flash": {
    modelId: "gemini-2-0-flash",
    scores: {
      math500: 76.5,
      gpqa: 62.1,
      mmlu_pro: 77.2,
      swe_bench: 38.6,
      humaneval: 85.2,
    },
    notes: "Google DeepMind Gemini 2.0 Flash Technical Report (Dec 2024).",
  },
  "gemini-2-0-pro-exp": {
    modelId: "gemini-2-0-pro-exp",
    scores: {
      math500: 87.8,
      gpqa: 70.8,
      mmlu_pro: 82.4,
      swe_bench: 46.2,
      humaneval: 92.5,
    },
    notes: "Google DeepMind Gemini 2.0 Pro Experimental Announcement (Feb 2025).",
  },
  "gemini-1-5-pro": {
    modelId: "gemini-1-5-pro",
    scores: {
      math500: 67.7,
      gpqa: 58.5,
      mmlu_pro: 74.3,
      swe_bench: 32.7,
      humaneval: 84.1,
    },
    notes: "Google DeepMind Gemini 1.5 Technical Report (May 2024).",
  },
  "gpt-4o": {
    modelId: "gpt-4o",
    scores: {
      math500: 74.6,
      gpqa: 53.6,
      mmlu_pro: 72.5,
      swe_bench: 38.8,
      humaneval: 90.2,
    },
    notes: "OpenAI GPT-4o Evaluation Card (May 2024).",
  },
  "deepseek-v3": {
    modelId: "deepseek-v3",
    scores: {
      math500: 75.7,
      gpqa: 59.1,
      mmlu_pro: 75.9,
      swe_bench: 42.0,
      humaneval: 82.6,
    },
    notes: "DeepSeek-V3 Technical Report (Dec 2024). 671B MoE base model.",
  },
  "llama-3-3-70b": {
    modelId: "llama-3-3-70b",
    scores: {
      math500: 73.8,
      gpqa: 50.5,
      mmlu_pro: 68.3,
      swe_bench: 32.5,
      humaneval: 81.7,
    },
    notes: "Meta AI Llama 3.3 Evaluation Card (Dec 2024). Matches Llama 3.1 405B on core benchmarks.",
  },
  "llama-3-1-405b": {
    modelId: "llama-3-1-405b",
    scores: {
      math500: 73.8,
      gpqa: 51.1,
      mmlu_pro: 73.3,
      swe_bench: 33.6,
      humaneval: 89.0,
    },
    notes: "Meta AI Llama 3.1 405B Research Paper (Jul 2024).",
  },
  "qwen-2-5-72b": {
    modelId: "qwen-2-5-72b",
    scores: {
      math500: 83.1,
      gpqa: 54.5,
      mmlu_pro: 71.6,
      swe_bench: 35.8,
      humaneval: 86.4,
    },
    notes: "Alibaba Cloud Qwen 2.5 Technical Report (Sep 2024). Apache 2.0 open weights.",
  },
  "qwen-2-5-coder-32b": {
    modelId: "qwen-2-5-coder-32b",
    scores: {
      math500: 82.5,
      gpqa: 48.2,
      mmlu_pro: 66.8,
      swe_bench: 39.4,
      humaneval: 92.7,
    },
    notes: "Alibaba Cloud Qwen 2.5-Coder Report (Nov 2024). Leading open coding engine.",
  },
  "mistral-large-2": {
    modelId: "mistral-large-2",
    scores: {
      math500: 71.0,
      gpqa: 49.5,
      mmlu_pro: 69.8,
      swe_bench: 38.0,
      humaneval: 84.0,
    },
    notes: "Mistral AI Mistral Large 2 Release Card (Jul 2024).",
  },
};

export interface ComparisonPairMeta {
  slug: string;
  modelAId: string;
  modelBId: string;
  title: string;
  tagline: string;
  summary: string;
  highlights: string[];
}

export const POPULAR_COMPARISONS: ComparisonPairMeta[] = [
  {
    slug: "deepseek-r1-vs-openai-o1",
    modelAId: "deepseek-r1",
    modelBId: "openai-o1",
    title: "DeepSeek-R1 vs OpenAI o1",
    tagline: "Open-Weights Reasoning vs Proprietary STEM Intelligence",
    summary:
      "A head-to-head comparison of the two landmark reasoning models of 2024–2025. DeepSeek-R1 provides open-weights under an MIT license trained via pure reinforcement learning, while OpenAI o1 utilizes proprietary test-time compute for exceptional PhD-level science and competitive coding.",
    highlights: [
      "DeepSeek-R1 offers fully open weights with an MIT license; OpenAI o1 is closed proprietary API.",
      "MATH 500: DeepSeek-R1 scores 97.3% vs OpenAI o1's 96.4%.",
      "GPQA Diamond: OpenAI o1 holds the edge at 77.3% vs DeepSeek-R1's 71.5%.",
      "Inference cost: DeepSeek-R1 delivers 10x–20x lower API pricing and can be self-hosted.",
    ],
  },
  {
    slug: "gemini-2-0-flash-vs-gpt-4o",
    modelAId: "gemini-2-0-flash",
    modelBId: "gpt-4o",
    title: "Gemini 2.0 Flash vs GPT-4o",
    tagline: "Sub-Second Multimodal Speed vs Conversational Omnimodality",
    summary:
      "Gemini 2.0 Flash brings 1 million tokens of context and native bidirectional multimodal streaming, competing against OpenAI's flagship GPT-4o conversational model.",
    highlights: [
      "Context Window: Gemini 2.0 Flash supports 1M tokens vs GPT-4o's 128k tokens.",
      "Latency: Gemini 2.0 Flash is optimized for sub-second agentic tool loops and multimodal streaming.",
      "MMLU-Pro: Gemini 2.0 Flash scores 77.2% vs GPT-4o's 72.5%.",
      "Cost: Gemini 2.0 Flash offers significantly lower token pricing in Google AI Studio.",
    ],
  },
  {
    slug: "claude-3-5-sonnet-vs-gpt-4o",
    modelAId: "claude-3-5-sonnet",
    modelBId: "gpt-4o",
    title: "Claude 3.5 Sonnet vs GPT-4o",
    tagline: "The Benchmark Leader in Software Engineering vs OpenAI's Omni Flagship",
    summary:
      "Anthropic's Claude 3.5 Sonnet is widely considered the premier model for software development, nuanced writing, and Computer Use GUI automation, rivaling OpenAI's flagship GPT-4o.",
    highlights: [
      "SWE-bench Verified: Claude 3.5 Sonnet scores 49.0% vs GPT-4o's 38.8%.",
      "Context Window: Claude 3.5 Sonnet has 200k tokens vs GPT-4o's 128k tokens.",
      "Computer Use: Claude 3.5 Sonnet features native OS GUI mouse and keyboard control APIs.",
      "Reasoning: Claude 3.5 Sonnet leads on graduate-level STEM and architectural refactoring.",
    ],
  },
  {
    slug: "claude-3-5-sonnet-vs-deepseek-r1",
    modelAId: "claude-3-5-sonnet",
    modelBId: "deepseek-r1",
    title: "Claude 3.5 Sonnet vs DeepSeek-R1",
    tagline: "Agentic Engineering Powerhouse vs Open Deliberate Reasoning",
    summary:
      "Comparing Anthropic's premier developer foundation model with DeepSeek's open-weights reasoning architecture. Claude excels in repo-wide coding context and tone, while DeepSeek-R1 dominates mathematical proofs and logical theorems.",
    highlights: [
      "MATH 500: DeepSeek-R1 achieves 97.3% vs Claude 3.5 Sonnet's 78.3%.",
      "SWE-bench: Both models are neck-and-neck at 49.0% (Claude) and 49.2% (DeepSeek-R1).",
      "Licensing: DeepSeek-R1 is MIT open weights; Claude 3.5 Sonnet is a proprietary API.",
      "Modality: Claude 3.5 Sonnet includes native high-res vision; DeepSeek-R1 is focused on text and code.",
    ],
  },
  {
    slug: "llama-3-3-70b-vs-qwen-2-5-72b",
    modelAId: "llama-3-3-70b",
    modelBId: "qwen-2-5-72b",
    title: "Llama 3.3 70B vs Qwen 2.5 72B",
    tagline: "The Clash of the 70B Open-Weights Champions",
    summary:
      "A showdown between the two most capable 70-billion-parameter open foundation models in the world. Meta AI's Llama 3.3 70B matches the previous 405B flagship, while Alibaba Cloud's Qwen 2.5 72B leads in multilingual capability and math under an Apache 2.0 license.",
    highlights: [
      "Licensing: Qwen 2.5 72B uses Apache 2.0; Llama 3.3 uses the Llama Community License.",
      "MATH 500: Qwen 2.5 72B scores 83.1% vs Llama 3.3 70B's 73.8%.",
      "Context: Both models support 128,000 tokens of context window.",
      "Hardware: Both models run on a single dual-GPU or 4-GPU workstation node with 4-bit quantization.",
    ],
  },
  {
    slug: "openai-o1-vs-openai-o3-mini",
    modelAId: "openai-o1",
    modelBId: "openai-o3-mini",
    title: "OpenAI o1 vs OpenAI o3-mini",
    tagline: "Flagship Reasoning vs High-Velocity STEM Precision",
    summary:
      "Comparing OpenAI's frontier o1 reasoning model with the faster, configurable o3-mini model designed for high-throughput coding and mathematics.",
    highlights: [
      "Reasoning Control: o3-mini provides configurable low, medium, and high reasoning effort parameters.",
      "MATH 500: o3-mini (high) scores 97.9% vs o1's 96.4%.",
      "SWE-bench: o3-mini resolves 49.3% vs o1's 48.9%.",
      "Cost & Speed: o3-mini offers dramatically lower API latency and pricing.",
    ],
  },
  {
    slug: "gemini-2-0-pro-exp-vs-claude-3-5-sonnet",
    modelAId: "gemini-2-0-pro-exp",
    modelBId: "claude-3-5-sonnet",
    title: "Gemini 2.0 Pro Exp vs Claude 3.5 Sonnet",
    tagline: "2 Million Token Multimodal Frontier vs Software Engineering King",
    summary:
      "Google's most capable reasoning model with a 2,000,000-token context window compared to Anthropic's flagship Claude 3.5 Sonnet.",
    highlights: [
      "Context Window: Gemini 2.0 Pro offers 2,000,000 tokens vs Claude's 200,000 tokens.",
      "MATH 500: Gemini 2.0 Pro scores 87.8% vs Claude 3.5 Sonnet's 78.3%.",
      "GPQA Diamond: Gemini 2.0 Pro scores 70.8% vs Claude's 65.0%.",
      "SWE-bench: Claude 3.5 Sonnet retains leadership at 49.0% vs Gemini's 46.2%.",
    ],
  },
  {
    slug: "qwen-2-5-coder-32b-vs-claude-3-5-sonnet",
    modelAId: "qwen-2-5-coder-32b",
    modelBId: "claude-3-5-sonnet",
    title: "Qwen 2.5 Coder 32B vs Claude 3.5 Sonnet",
    tagline: "Open-Source Local Coding Engine vs Proprietary Cloud Leader",
    summary:
      "Can an open-weights 32-billion parameter model run on a consumer GPU rival the world's best cloud coding model? This comparison breaks down real-world coding benchmarks.",
    highlights: [
      "Deployment: Qwen 2.5 Coder 32B runs locally on 24GB VRAM; Claude 3.5 Sonnet requires Anthropic API.",
      "HumanEval: Qwen 2.5 Coder scores 92.7% vs Claude 3.5 Sonnet's 93.7%.",
      "SWE-bench: Claude 3.5 Sonnet leads at 49.0% vs Qwen's 39.4%.",
      "Licensing: Qwen 2.5 Coder is 100% Apache 2.0 open source.",
    ],
  },
  {
    slug: "deepseek-v3-vs-llama-3-1-405b",
    modelAId: "deepseek-v3",
    modelBId: "llama-3-1-405b",
    title: "DeepSeek-V3 vs Llama 3.1 405B",
    tagline: "671B Sparse MoE Efficiency vs 405B Dense Brute Force",
    summary:
      "A clash of the open-weights giants: DeepSeek's 671B sparse MoE architecture with Multi-head Latent Attention against Meta's 405B dense foundation model.",
    highlights: [
      "Active Parameters: DeepSeek-V3 activates only 37B params per token vs Llama's 405B dense calculation.",
      "Training Cost: DeepSeek-V3 was trained for <$6M vs Meta's estimated hundreds of millions.",
      "MMLU-Pro: DeepSeek-V3 scores 75.9% vs Llama 3.1 405B's 73.3%.",
      "Licensing: DeepSeek-V3 is MIT; Llama 3.1 has monthly commercial user limits.",
    ],
  },
  {
    slug: "flux-1-dev-vs-midjourney-v6-1",
    modelAId: "flux-1-dev",
    modelBId: "midjourney-v6-1",
    title: "FLUX.1 [dev] vs Midjourney v6.1",
    tagline: "Open Flow Transformer vs Commercial Aesthetic Benchmark",
    summary:
      "The definitive generative image synthesis comparison between Black Forest Labs' 12B open weights flow transformer and Midjourney's commercial platform.",
    highlights: [
      "Weights: FLUX.1 [dev] weights can be downloaded and run locally via ComfyUI; Midjourney is closed Discord/Web SaaS.",
      "Typography: FLUX.1 sets a new state of the art for legible in-image text spelling.",
      "Community: FLUX.1 supports endless open LoRA fine-tunes and ControlNet adaptations.",
      "Aesthetics: Midjourney v6.1 excels in out-of-the-box cinematic lighting and skin textures.",
    ],
  },
];
