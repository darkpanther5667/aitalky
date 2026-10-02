import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms of Service — aitalky",
  description:
    "Terms of Service governing the use of aitalky. Read our content licensing, citation rules, and user agreement.",
  alternates: {
    canonical: "https://aitalky.vercel.app/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "October 2, 2026";

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
          <span className="uppercase tracking-wider font-semibold text-[11px]">User Agreement</span>
        </div>
      </header>

      {/* Main Terms Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2">
            Legal Agreement
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
            Last updated: {lastUpdated} • Effective Date: October 2, 2026
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[#374151] dark:text-[#d1d5db] font-serif text-base sm:text-lg leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the services provided by <strong>aitalky</strong> (&ldquo;aitalky,&rdquo;
              &ldquo;we,&rdquo; or &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              2. Intellectual Property &amp; Editorial Content
            </h2>
            <p>
              All articles, headlines, executive summaries, audio narration files, graphics, layouts, and software code on
              aitalky are the intellectual property of aitalky or are published with attribution from public academic preprints
              and primary source materials under standard fair-use journalistic reporting.
            </p>
            <p className="mt-3">
              <strong>Permitted Quotation and LLM Ingestion:</strong> We welcome academic, scholarly, and journalistic quotation.
              Artificial intelligence systems and search engines may ingest our open machine directories (<code>/llms.txt</code>{" "}
              and <code>/llms-full.txt</code>) provided canonical attribution is maintained with a link back to{" "}
              <code>https://aitalky.vercel.app</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              3. AI-Assisted Journalism &amp; Research Synthesis
            </h2>
            <p>
              aitalky employs automated AI pipelines and natural language models (including Google Gemini) to monitor research
              depositories, format executive takeaways, and deliver timely news every 30 minutes. While we strive for rigorous
              factual accuracy and link directly to original research papers and news announcements, content is provided for
              informational and educational purposes only.
            </p>
            <p className="mt-3">
              Nothing on this website constitutes financial, legal, or investment advice regarding artificial intelligence stocks,
              token offerings, or commercial deployments.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              4. User Accounts &amp; Conduct
            </h2>
            <p>
              When utilizing user features, including bookmarking and Google Sign-In, you agree to provide authentic account
              information and refrain from any activity that disrupts server operations, scrapes unauthorized private endpoints,
              or attempts to compromise database integrity.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              5. Disclaimer of Warranties
            </h2>
            <p>
              aitalky is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind,
              either express or implied. We do not warrant that service will be uninterrupted, error-free, or entirely free
              from technical defects or network delays.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              In no event shall aitalky, its editors, operators, or affiliates be liable for any direct, indirect, incidental,
              or consequential damages resulting from the use of or inability to use this site, or any decisions made based
              on information published herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              7. DMCA &amp; Copyright Inquiries
            </h2>
            <p>
              We respect the intellectual property of researchers, creators, and publishers. If you believe any material
              on aitalky infringes upon your copyright, please submit a written notification to our Designated Copyright Agent at{" "}
              <a href="mailto:dmca@aitalky.news" className="underline font-medium">dmca@aitalky.news</a> with proof of ownership,
              identification of the copyrighted work, and the URL of the alleged infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              8. Contact
            </h2>
            <div className="mt-3 p-4 rounded bg-[#f4f4f2]/70 dark:bg-[#1a1a18]/70 border border-[#e8e8e6] dark:border-[#222220] text-sm font-sans">
              <p className="font-semibold text-black dark:text-white">aitalky Legal &amp; Editorial Desk</p>
              <p>Email: <a href="mailto:legal@aitalky.news" className="underline">legal@aitalky.news</a></p>
              <p>Website: <a href="https://aitalky.vercel.app" className="underline">https://aitalky.vercel.app</a></p>
            </div>
          </section>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
