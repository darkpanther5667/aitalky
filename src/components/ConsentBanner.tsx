"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("aitalky-consent");
      if (!consent) {
        setShowBanner(true);
      } else if (consent === "granted") {
        updateGtagConsent("granted");
      }
    } catch {
      // ignore
    }
  }, []);

  const updateGtagConsent = (status: "granted" | "denied") => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
        analytics_storage: status,
      });
    }
  };

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("aitalky-consent", "granted");
    } catch {}
    updateGtagConsent("granted");
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    try {
      localStorage.setItem("aitalky-consent", "denied");
    } catch {}
    updateGtagConsent("denied");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#141412] text-[#141413] dark:text-[#f3f3f0] border border-[#e8e8e6] dark:border-[#2a2a28] shadow-2xl transition-all"
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs leading-relaxed">
          <p className="font-semibold text-sm mb-1">Privacy &amp; Cookie Preferences</p>
          <p className="text-[#6b7280] dark:text-[#9ca3af] mb-3">
            aitalky uses standard cookies to enable essential site navigation and support Google AdSense personalization in compliance with EEA &amp; UK standards (Consent Mode v2).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] font-semibold text-xs hover:opacity-90 transition cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="px-3.5 py-1.5 rounded-md border border-[#d1d5db] dark:border-[#374151] hover:bg-[#f4f4f2] dark:hover:bg-[#1f1f1d] font-medium text-xs transition cursor-pointer"
            >
              Reject Non-Essential
            </button>
            <Link
              href="/privacy"
              className="text-xs text-[#6b7280] dark:text-[#9ca3af] underline hover:text-black dark:hover:text-white ml-1"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <button
          onClick={handleRejectNonEssential}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
