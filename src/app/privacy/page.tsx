import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — aitalky",
  description:
    "Privacy Policy for aitalky. Learn how we collect, handle, and protect your data, including Google AdSense advertising and cookie disclosures.",
  alternates: {
    canonical: "https://aitalky.vercel.app/privacy",
  },
};

export default function PrivacyPolicyPage() {
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
          <span className="uppercase tracking-wider font-semibold text-[11px]">Legal Document</span>
        </div>
      </header>

      {/* Main Legal Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2">
            Transparency & Compliance
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
            Last updated: {lastUpdated} • Effective Date: October 2, 2026
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[#374151] dark:text-[#d1d5db] font-serif text-base sm:text-lg leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>aitalky</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), accessible at{" "}
              <a href="https://aitalky.vercel.app" className="underline">https://aitalky.vercel.app</a>. We are committed to
              protecting the personal privacy of readers, researchers, and visitors who engage with our publication.
              This Privacy Policy explains what information we collect, how it is processed, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              2. Information We Collect
            </h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Log and Device Data:</strong> When you access aitalky, our web hosting servers (Vercel) automatically
                log standard technical information, including your IP address, browser type, referring pages, timestamps,
                and basic device telemetry.
              </li>
              <li>
                <strong>Voluntary Account and Newsletter Data:</strong> When you subscribe to our newsletter or sign in via
                Google OAuth / Supabase Authentication, we collect your email address, display name, and avatar solely to
                provide authentication, bookmark synchronization, and subscriber delivery.
              </li>
              <li>
                <strong>Local Storage:</strong> We use your browser&rsquo;s local storage to save your reading preferences,
                such as dark mode toggle and saved article bookmarks, without transmitting personal identifiers to third parties.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-lg bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#2a2a28]">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              3. Google AdSense & Third-Party Advertising Disclosures
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              aitalky partners with third-party advertising vendors, including <strong>Google AdSense</strong>, to display
              advertisements when you visit our website.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior visits to your
                website or other websites on the Internet.
              </li>
              <li>
                Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to our users based on their
                visit to our site and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Google Ads Settings
                </a>. Alternatively, you can opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising
                by visiting{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  www.aboutads.info
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              4. Cookies and Web Beacons
            </h2>
            <p>
              Like any modern publication, aitalky uses cookies to optimize site speed, store theme preferences, and track
              aggregated view counters. You can instruct your browser to refuse all cookies or to indicate when a cookie
              is being sent. However, some interactive features may not function properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              5. European Union (GDPR) Data Protection Rights
            </h2>
            <p>
              If you reside in the European Economic Area (EEA), you possess certain statutory data rights under the General
              Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The right to access the personal data we hold about you.</li>
              <li>The right to request rectification of inaccurate information.</li>
              <li>The right to request erasure of your personal data (&ldquo;Right to be Forgotten&rdquo;).</li>
              <li>The right to object to or restrict processing of your data.</li>
              <li>The right to data portability.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact our Data Privacy Desk at{" "}
              <a href="mailto:privacy@aitalky.news" className="underline font-medium">privacy@aitalky.news</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              6. California Consumer Privacy Act (CCPA / CPRA)
            </h2>
            <p>
              For California residents, aitalky complies with the California Consumer Privacy Act. We do not sell your personal
              information. You have the right to request disclosure of the categories of personal data collected, request
              deletion, and receive equal service without discrimination.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              7. Children&rsquo;s Online Privacy (COPPA)
            </h2>
            <p>
              aitalky is an analytical artificial intelligence journalism publication directed at professionals, researchers,
              and the general public. We do not knowingly collect personal identifiable information from children under the
              age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3">
              8. Contact the Privacy Team
            </h2>
            <p>
              If you have any questions, inquiries, or requests regarding this Privacy Policy, please reach out to:
            </p>
            <div className="mt-3 p-4 rounded bg-[#f4f4f2]/70 dark:bg-[#1a1a18]/70 border border-[#e8e8e6] dark:border-[#222220] text-sm font-sans">
              <p className="font-semibold text-black dark:text-white">aitalky Editorial &amp; Legal Desk</p>
              <p>Email: <a href="mailto:privacy@aitalky.news" className="underline">privacy@aitalky.news</a></p>
              <p>Website: <a href="https://aitalky.vercel.app" className="underline">https://aitalky.vercel.app</a></p>
            </div>
          </section>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
