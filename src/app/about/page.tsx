import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Newspaper, Cpu, ExternalLink, Mail, Clock } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About aitalky — Mission, Aggregation Methodology & Editorial Ethics",
  description:
    "Transparent overview of aitalky: an automated AI news aggregator curating trusted industry reporting, providing grounded AI-assisted summaries, and strictly linking back to original sources.",
  alternates: {
    canonical: "https://aitalky.vercel.app/about",
  },
};

const MONITORED_SOURCES = [
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/", focus: "Venture funding, startups & industry news" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/", focus: "Frontier scientific research & architectural milestones" },
  { name: "OpenAI News", url: "https://openai.com/news/", focus: "Model releases, product launches & safety research" },
  { name: "Hugging Face", url: "https://huggingface.co/blog", focus: "Open-source weights, transformers & model benchmarks" },
  { name: "arXiv cs.AI / cs.LG", url: "https://arxiv.org", focus: "Peer-reviewed & preprint computer science research papers" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/", focus: "In-depth investigative technology journalism" },
  { name: "Ars Technica AI", url: "https://arstechnica.com/tag/ai/", focus: "Technical analysis, policy reviews & hardware compute" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", focus: "Consumer impact, creative industry & ethics" },
  { name: "Wired AI", url: "https://www.wired.com/tag/ai/", focus: "Culture, labor dynamics & societal implications" },
  { name: "SiliconANGLE AI", url: "https://siliconangle.com/category/ai/", focus: "Enterprise infrastructure, cloud vendors & data platforms" },
  { name: "MarkTechPost", url: "https://www.marktechpost.com/", focus: "AI engineering papers, open libraries & tutorials" },
  { name: "AWS Machine Learning Blog", url: "https://aws.amazon.com/blogs/machine-learning/", focus: "Cloud infrastructure, model training & enterprise architecture" },
  { name: "NVIDIA Blog", url: "https://blogs.nvidia.com/", focus: "Semiconductor compute, GPUs & physical AI" },
  { name: "InfoQ AI/ML", url: "https://feed.infoq.com/ai-ml-data-eng/news", focus: "Software engineering, production inference & data pipelines" },
  { name: "The Register AI", url: "https://www.theregister.com/software/ai_ml/", focus: "Critical enterprise reporting, regulatory filings & hardware" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col transition-colors">
      {/* Top Breadcrumb Nav */}
      <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to aitalky</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <span className="uppercase tracking-wider font-semibold text-[11px]">Methodology &amp; Ethics</span>
        </div>
      </header>

      {/* Main About Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-12 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2">
            Independent AI Aggregator
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
            About aitalky
          </h1>
          <p className="text-base sm:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
            aitalky is an automated news aggregator and intelligence engine dedicated to frontier artificial intelligence, machine learning research, and algorithmic governance.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <Newspaper className="w-5 h-5 text-black dark:text-white mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">Honest Attribution</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              We never republish full third-party articles. Every story shows excerpts or short summaries with direct links to primary reporting.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">Grounded Summaries</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              AI-assisted summaries are strictly confined to the facts explicitly in the source text. Zero invented facts, quotes, or claims.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">Zero Tech Junk</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Aggressive filtering eliminates consumer gadget sales, keyboard deals, affiliate junk, and clickbait.
            </p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[#374151] dark:text-[#d1d5db] font-serif text-base sm:text-lg leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              How aitalky Works
            </h2>
            <p>
              aitalky continuously monitors official syndication feeds (RSS/Atom) and arXiv preprints from premier research institutes, foundational model labs, and specialized technology desks.
            </p>
            <p className="mt-3">
              Every 30 minutes, our automated ingestion engine:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2 text-base">
              <li>Decodes and cleans raw incoming titles, eliminating syndicate boilerplate and tracking parameters.</li>
              <li>Filters out non-AI consumer retail promotions through strict negative heuristics.</li>
              <li>Clusters concurrent reporting from multiple outlets onto a unified primary card with &ldquo;Also covered by&rdquo; links.</li>
              <li>Generates concise, factual 2&ndash;3 sentence executive summaries and a single-line &ldquo;Why it matters&rdquo; analysis, labeled transparently as machine-assisted.</li>
            </ul>
          </section>

          <section id="sources" className="pt-6 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Monitored Publications &amp; Research Feeds
            </h2>
            <p className="text-sm font-sans text-[#6b7280] dark:text-[#9ca3af] mb-4">
              We aggregate and direct traffic to the following trusted primary sources:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans not-prose">
              {MONITORED_SOURCES.map((src, i) => (
                <div
                  key={i}
                  className="p-3 rounded border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#161614] flex flex-col justify-between"
                >
                  <div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener nofollow"
                      className="font-semibold text-xs text-[#141413] dark:text-[#f3f3f0] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{src.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1 leading-snug">
                      {src.focus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="ethics" className="pt-6 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Editorial Policy, AI Disclosure &amp; Ethics
            </h2>
            <div className="space-y-4 text-base">
              <p>
                <strong>1. Machine-Assisted Summaries:</strong> Brief summaries and &ldquo;Why it matters&rdquo; bullet points are generated using Google Gemini models. While our prompts enforce strict factual grounding in the source text, machine summaries may occasionally contain interpretations or inaccuracies. Original reporting and complete context always belong to the attributed source publication.
              </p>
              <p>
                <strong>2. Copyright &amp; Fair Use:</strong> aitalky operates strictly as a news curator and aggregator. We do not reproduce full articles. Our index stores only the title, publication metadata, and excerpts necessary to guide readers to the original reporting.
              </p>
              <p>
                <strong>3. Publisher Takedowns &amp; Corrections Commitment:</strong> If you are a copyright holder, journalist, or publisher wishing to update attribution, correct an inaccuracy, or request the immediate removal of your feed from our aggregator, please contact us. We commit to reviewing and fulfilling all legitimate publisher takedown requests within <strong>24 hours</strong>.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] not-prose flex items-start gap-3">
              <Mail className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#141413] dark:text-[#f3f3f0] mb-0.5">
                  Publisher Corrections &amp; Takedown Desk
                </h4>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2 leading-relaxed">
                  Direct inquiries regarding content attribution, removals, or editorial feedback:
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href="mailto:contact@aitalky.vercel.app"
                    className="font-medium text-black dark:text-white underline"
                  >
                    contact@aitalky.vercel.app
                  </a>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <Link href="/contact" className="hover:underline text-[#6b7280] dark:text-[#9ca3af]">
                    Submit via Web Form →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
