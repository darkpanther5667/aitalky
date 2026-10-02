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
    subject: "Editorial Inquiry / Takedown Request",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "Editorial Inquiry / Takedown Request",
          message: "",
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to deliver message. Please use the direct email link.");
      }
    } catch {
      setErrorMessage("Network error. Please email us directly at contact@aitalky.vercel.app.");
    } finally {
      setIsSubmitting(false);
    }
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
            Contact &amp; Corrections Desk
          </h1>
          <p className="text-base sm:text-lg font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
            Publisher takedown requests, editorial corrections, research paper submissions, or general inquiries. We commit to a response within 24 hours.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Corrections &amp; Takedowns</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2 leading-relaxed">
              Publisher removals or factual corrections fulfilled within 24 hours.
            </p>
            <a href="mailto:contact@aitalky.vercel.app?subject=Publisher%20Correction%20or%20Takedown" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              contact@aitalky.vercel.app
            </a>
          </div>

          <div className="p-5 rounded-lg bg-[#f4f4f2]/70 dark:bg-[#181816]/70 border border-[#e8e8e6] dark:border-[#2a2a28]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-[#141413] dark:text-[#f3f3f0]">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Paper Submissions &amp; Tips</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2 leading-relaxed">
              Submit newly published preprints, datasets, or laboratory releases.
            </p>
            <a href="mailto:contact@aitalky.vercel.app?subject=Paper%20Submission" className="text-xs font-mono font-medium underline hover:text-black dark:hover:text-white">
              contact@aitalky.vercel.app
            </a>
          </div>
        </div>

        {/* Web Submission Form */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#141412]">
          <h2 className="text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-2">
            Send an Editorial Message
          </h2>
          <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] mb-6">
            Directly delivered to the newsroom desk. All submissions are logged and reviewed.
          </p>

          {submitted ? (
            <div className="p-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Message Received
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                Thank you for reaching out. The aitalky editorial team reviews all inquiries promptly. For urgent copyright or takedown notices, you will hear back within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs underline font-medium text-emerald-800 dark:text-emerald-300 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#2a2a28] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#2a2a28] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                  Subject / Topic
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#2a2a28] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  <option value="Editorial Inquiry / Takedown Request">Publisher Takedown / Content Removal</option>
                  <option value="Factual Correction">Factual Correction / Misattribution</option>
                  <option value="Research Preprint Submission">Paper / Research Preprint Submission</option>
                  <option value="Sponsorship / Partnership">Advertising &amp; Sponsorship</option>
                  <option value="Other">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Include any article URLs, citations, or relevant details..."
                  className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#2a2a28] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Transmitting..." : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
