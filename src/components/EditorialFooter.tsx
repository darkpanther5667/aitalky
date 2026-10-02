import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function EditorialFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e8e8e6] dark:border-[#222220] py-14 mt-16 bg-[#f4f4f2]/40 dark:bg-[#141412]/40 text-xs text-[#6b7280] dark:text-[#9ca3af]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#e8e8e6] dark:border-[#222220]">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showSubtitle={true} />
            <p className="max-w-sm text-xs leading-relaxed text-[#4b5563] dark:text-[#9ca3af] mt-2">
              An independent, typographic news publication covering the breakthroughs, science, economics, and ethics of artificial intelligence. Refreshed continuously every 30 minutes from global industry feeds and arXiv.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Automated 30m Wire Active
              </span>
            </div>
          </div>

          {/* Coverage Sections */}
          <div>
            <span className="font-semibold text-black dark:text-white block mb-3 uppercase tracking-wider text-[11px]">
              Editorial Desks
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/category/industry" className="hover:text-black dark:hover:text-white transition">
                  Industry & Enterprise
                </Link>
              </li>
              <li>
                <Link href="/category/research" className="hover:text-black dark:hover:text-white transition">
                  Research & Science (arXiv)
                </Link>
              </li>
              <li>
                <Link href="/category/products" className="hover:text-black dark:hover:text-white transition">
                  Models & Developer Tools
                </Link>
              </li>
              <li>
                <Link href="/category/policy" className="hover:text-black dark:hover:text-white transition">
                  Policy, Law & Governance
                </Link>
              </li>
              <li>
                <Link href="/category/culture" className="hover:text-black dark:hover:text-white transition">
                  Culture & Human Impact
                </Link>
              </li>
              <li>
                <Link href="/brief" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                  Daily Brief Synthesis ↗
                </Link>
              </li>
              <li>
                <Link href="/models" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                  AI Models Directory (30+) ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <span className="font-semibold text-black dark:text-white block mb-3 uppercase tracking-wider text-[11px]">
              Standards & Legal
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-black dark:hover:text-white transition">
                  About aitalky
                </Link>
              </li>
              <li>
                <Link href="/about#ethics" className="hover:text-black dark:hover:text-white transition">
                  Editorial Ethics & AI Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-black dark:hover:text-white transition">
                  Privacy Policy & Cookies
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black dark:hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition">
                  Contact & Corrections
                </Link>
              </li>
            </ul>
          </div>

          {/* Machine & AI Discovery */}
          <div>
            <span className="font-semibold text-black dark:text-white block mb-3 uppercase tracking-wider text-[11px]">
              Machine & Open Data
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/models" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /models (Frontier Index)
                </Link>
              </li>
              <li>
                <a href="/llms.txt" target="_blank" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /llms.txt (AI Directory)
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /sitemap.xml
                </a>
              </li>
              <li>
                <a href="/news-sitemap.xml" target="_blank" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /news-sitemap.xml (Google News)
                </a>
              </li>
              <li>
                <a href="/ads.txt" target="_blank" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /ads.txt (AdSense)
                </a>
              </li>
              <li>
                <a href="/api/news" target="_blank" className="hover:text-black dark:hover:text-white transition font-mono text-[11px]">
                  /api/news (JSON API)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9ca3af]">
          <div>
            &copy; {currentYear} aitalky. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/about#ethics" className="hover:underline">Ethics</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
