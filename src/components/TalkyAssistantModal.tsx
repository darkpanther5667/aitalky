"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Loader2, Volume2, BookOpen } from "lucide-react";
import { speechManager } from "@/lib/speech";

interface TalkyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle?: string;
  articleContext?: string;
}

interface ChatMessage {
  role: "user" | "aitalky";
  content: string;
}

export function TalkyAssistantModal({
  isOpen,
  onClose,
  articleTitle,
  articleContext,
}: TalkyAssistantModalProps) {
  const initialGreeting = articleTitle
    ? `I'm your editorial research desk for "${articleTitle}". Ask me to explain the technical architecture, break down the commercial impact, or provide a critical reality check.`
    : "Welcome to the aitalky research desk. I analyze frontier AI developments across model weights, inference economics, academic papers, and governance policy. What can I help clarify?";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "aitalky",
      content: initialGreeting,
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (userText: string, mode?: string) => {
    if (!userText.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          articleTitle,
          articleContext,
          mode: mode || "general",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "aitalky", content: data.reply || "Analysis generated." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "aitalky",
          content: "Unable to connect to the editorial analysis engine. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (!speechManager) return;
    speechManager.speak(text);
  };

  const suggestions = articleTitle
    ? [
        { label: "Why this matters", mode: "impact", prompt: `What is the real-world impact of ${articleTitle}?` },
        { label: "Explain simply", mode: "eli5", prompt: `Explain ${articleTitle} in plain English without technical jargon.` },
        { label: "Skeptical take", mode: "critique", prompt: `What are the caveats or overhyped claims in ${articleTitle}?` },
        { label: "Architecture mechanism", mode: "technical", prompt: `What is the core technical architecture behind this development?` },
      ]
    : [
        { label: "Today's top breakthroughs", prompt: "What are the most consequential AI developments this week?" },
        { label: "Reasoning vs Pretraining", mode: "technical", prompt: "How does test-time compute scaling differ from pretraining scaling?" },
        { label: "Open weights frontier", prompt: "Which open-weights models are currently competitive with proprietary frontier models?" },
        { label: "Compute economics", mode: "impact", prompt: "How are inference costs changing for developers deploying autonomous agents?" },
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--background)] border border-[#e8e8e6] dark:border-[#222220] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Desk Header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e6] dark:border-[#222220] px-5 py-4 bg-[#fbfbf9] dark:bg-[#141413]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0]">
                aitalky Research Desk
              </h3>
              <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                Independent technical analysis &amp; context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-black dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-[11px] font-medium text-[#9ca3af]">
                <span>{m.role === "user" ? "You" : "aitalky Analyst"}</span>
                {m.role === "aitalky" && (
                  <button
                    onClick={() => handleSpeak(m.content)}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    title="Listen to answer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
              <div
                className={`p-4 rounded-lg max-w-[90%] text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium"
                    : "bg-[#f4f4f2] dark:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] border border-[#e8e8e6] dark:border-[#222220]"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af] pt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing editorial intelligence...</span>
            </div>
          )}
        </div>

        {/* Suggested Editorial Prompts */}
        {messages.length <= 2 && (
          <div className="px-5 py-3 border-t border-[#f0f0ee] dark:border-[#1e1e1c] bg-[#fafaf8] dark:bg-[#151514]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] block mb-2">
              Explore with the newsroom:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt, s.mode)}
                  className="text-xs px-2.5 py-1 rounded-md border border-[#e8e8e6] dark:border-[#282826] bg-white dark:bg-[#1f1f1d] hover:bg-[#f4f4f2] dark:hover:bg-[#282826] text-[#4b5563] dark:text-[#d1d5db] transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(query);
          }}
          className="border-t border-[#e8e8e6] dark:border-[#222220] p-3 sm:p-4 flex gap-2 bg-[#fbfbf9] dark:bg-[#141413]"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about model architectures, trade-offs, or paper citations..."
            className="flex-1 text-xs bg-white dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#282826] rounded-md px-3.5 py-2.5 text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
