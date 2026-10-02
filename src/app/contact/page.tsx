"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Editorial Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

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
          <span className="uppercase tracking-wider font-semibold text-[11px]">Newsroom Contacts</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-3">
            Contact the Newsroom
          </h1>
          <p className="text-base sm:text-lg font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
            Have a research breakthrough to share, a story correction, or a sponsorship inquiry? Reach our editorial desk below.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Story Tips &amp; Preprints</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
              Send papers, release notes, or intelligence to our newsroom team.
            </p>
            <a href="mailto:editor@aitalky.news" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              editor@aitalky.news
            </a>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Corrections &amp; Accuracy</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
              Report factual errors or citation issues for rapid review.
            </p>
            <a href="mailto:corrections@aitalky.news" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              corrections@aitalky.news
            </a>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Advertising &amp; Sponsorships</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
              Direct newsletter sponsorships, dedicated AI showcase placements, or AdSense publisher coordination.
            </p>
            <a href="mailto:ads@aitalky.news" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              ads@aitalky.news
            </a>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Legal &amp; Privacy Desk</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
              GDPR, CCPA requests, or DMCA copyright notifications.
            </p>
            <a href="mailto:privacy@aitalky.news" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              privacy@aitalky.news
            </a>
          </div>
        </div>

        {/* Interactive Message Form */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#f4f4f2]/50 dark:bg-[#161614]/50 border border-[#e8e8e6] dark:border-[#222220]">
          <h2 className="text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-2">
            Send an Editorial Message
          </h2>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-6">
            Messages are routed directly to the duty editor on shift.
          </p>

          {submitted ? (
            <div className="p-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                Message Dispatched
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm mx-auto">
                Thank you for contacting aitalky. Our newsroom reviews correspondence on a rolling basis.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "Editorial Inquiry", message: "" });
                }}
                className="mt-4 text-xs font-medium underline text-emerald-800 dark:text-emerald-300 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full px-3 py-2 rounded bg-white dark:bg-[#1f1f1d] border border-[#d1d5db] dark:border-[#383834] text-[#141413] dark:text-[#f3f3f0] focus:outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@university.edu"
                    className="w-full px-3 py-2 rounded bg-white dark:bg-[#1f1f1d] border border-[#d1d5db] dark:border-[#383834] text-[#141413] dark:text-[#f3f3f0] focus:outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                  Subject Area
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-white dark:bg-[#1f1f1d] border border-[#d1d5db] dark:border-[#383834] text-[#141413] dark:text-[#f3f3f0] focus:outline-none focus:border-black dark:focus:border-white transition"
                >
                  <option value="Editorial Inquiry">Editorial &amp; Story Tip</option>
                  <option value="Research Preprint">Academic Preprint Submission</option>
                  <option value="Correction">Factual Correction Request</option>
                  <option value="Advertising">Advertising &amp; Sponsorship</option>
                  <option value="Copyright">DMCA / Copyright Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                  Message / Submission Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Include links to research preprints, laboratory releases, or specific details..."
                  className="w-full px-3 py-2 rounded bg-white dark:bg-[#1f1f1d] border border-[#d1d5db] dark:border-[#383834] text-[#141413] dark:text-[#f3f3f0] focus:outline-none focus:border-black dark:focus:border-white transition font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Transmitting..." : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Verification Footnote */}
        <div className="mt-8 text-center text-[11px] text-[#9ca3af]">
          <span>aitalky Digital Media • Verified Publisher: <code>ca-pub-5606771623878852</code></span>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
