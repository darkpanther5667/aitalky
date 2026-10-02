import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Newspaper, Cpu } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About Us & Editorial Standards — aitalky",
  description:
    "Learn about aitalky's mission: independent, calm, anti-clickbait artificial intelligence news, research preprints, and editorial ethics.",
  alternates: {
    canonical: "https://aitalky.vercel.app/about",
  },
};

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
          <span className="uppercase tracking-wider font-semibold text-[11px]">Newsroom &amp; Ethics</span>
        </div>
      </header>

      {/* Main About Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-12 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2">
            Editorial Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
            About aitalky
          </h1>
          <p className="text-base sm:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
            An independent, typography-first newsroom dedicated solely to reporting the genuine science, developments, and implications of artificial intelligence.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <Newspaper className="w-5 h-5 text-black dark:text-white mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">Zero Tech Junk</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              No gaming hardware sales, keyboard discounts, or affiliate links. Strictly AI breakthroughs and preprints.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">30-Minute Ingestion</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Continuous monitoring of leading labs, arXiv preprints, and frontier model developments every half hour.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">Calm &amp; Factual</h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Designed for serious researchers, founders, and engineers seeking depth without hype or sensationalism.
            </p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[#374151] dark:text-[#d1d5db] font-serif text-base sm:text-lg leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Why We Built aitalky
            </h2>
            <p>
              The artificial intelligence landscape is advancing at unprecedented velocity. Unfortunately, most mainstream
              technology media dilutes critical breakthroughs with sensationalized clickbait, corporate marketing fluff,
              or irrelevant gadget sales.
            </p>
            <p className="mt-3">
              <strong>aitalky</strong> was created as an antidote: a calm, typographic publication that respects the reader&rsquo;s
              time and cognitive attention. We present executive summaries, razor-sharp bullet takeaways, audio narration,
              and links to original source papers so readers can absorb frontier developments in minutes.
            </p>
          </section>

          <section id="ethics" className="pt-4 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Editorial Standards &amp; Fact-Checking Policy
            </h2>
            <p>Our editorial process follows uncompromising standards:</p>
            <ul className="list-disc pl-6 space-y-2.5 mt-3 text-base">
              <li>
                <strong>Primary Source Attribution:</strong> Every story explicitly cites and links to the original research
                preprint, laboratory announcement, or legal filing.
              </li>
              <li>
                <strong>Relevance Filtering:</strong> Submissions and RSS feeds are programmatically and editorially verified
                to guarantee zero consumer tech retail promotions.
              </li>
              <li>
                <strong>Non-Sensationalist Tone:</strong> We deliberately avoid apocalyptic warnings or overhyped claims of
                artificial general intelligence. We focus on benchmark verification, architectural nuance, and societal impact.
              </li>
            </ul>
          </section>

          <section className="pt-4 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              AI Transparency &amp; Human Oversight
            </h2>
            <p>
              As a publication at the frontier of artificial intelligence, aitalky embraces modern machine intelligence
              in our newsroom operations. We utilize state-of-the-art language models (including Google Gemini) to monitor
              academic databases, structure key points, and assist in drafting executive summaries.
            </p>
            <p className="mt-3">
              All automated transformations adhere to our strict editorial rubric: preserving original quotes, preventing
              hallucinations, attributing author credits, and verifying claims against primary sources.
            </p>
          </section>

          <section className="pt-4 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Corrections &amp; Feedback Policy
            </h2>
            <p>
              Accuracy is the cornerstone of trust. When factual errors or misattributions occur, we correct them swiftly
              and transparently. If you identify an error in any article, preprint citation, or author role, please notify our
              editorial team at{" "}
              <a href="mailto:corrections@aitalky.news" className="underline font-medium">corrections@aitalky.news</a>.
            </p>
          </section>

          <section className="pt-4 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Contact the Newsroom
            </h2>
            <p>
              For press inquiries, research submissions, or editorial pitches, visit our{" "}
              <Link href="/contact" className="underline font-medium">Contact Page</Link> or email{" "}
              <a href="mailto:editor@aitalky.news" className="underline font-medium">editor@aitalky.news</a>.
            </p>
          </section>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
