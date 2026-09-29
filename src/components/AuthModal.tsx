"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          onSuccess(email.trim());
          onClose();
        } else {
          setMagicSent(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          onSuccess(email.trim());
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google sign in");
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address first.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-lg bg-[var(--background)] border border-[#e8e8e6] dark:border-[#222220] shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9ca3af] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <span className="font-serif text-2xl font-black text-[#141413] dark:text-[#f3f3f0]">
            aitalky
          </span>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 font-sans">
            {isSignUp ? "Create your reader account" : "Sign in to your reader account"}
          </p>
        </div>

        {magicSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0]">
              Check Your Inbox
            </h4>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              We sent a magic sign-in link to <strong>{email}</strong>. Click it to immediately access your account and saved stories.
            </p>
            <button
              onClick={() => {
                setMagicSent(false);
                onClose();
              }}
              className="mt-4 w-full py-2 px-3 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md border border-[#e8e8e6] dark:border-[#222220] bg-white dark:bg-[#1a1a18] hover:bg-[#f4f4f2] dark:hover:bg-[#252523] text-[#141413] dark:text-[#f3f3f0] text-xs font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-[#e8e8e6] dark:border-[#222220]"></div>
              <span className="shrink mx-3 text-[10px] text-[#9ca3af] uppercase tracking-wider">
                or continue with email
              </span>
              <div className="grow border-t border-[#e8e8e6] dark:border-[#222220]"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-semibold text-[#4b5563] dark:text-[#9ca3af] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] rounded-md pl-9 pr-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4b5563] dark:text-[#9ca3af] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] rounded-md pl-9 pr-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {loading ? "Processing..." : isSignUp ? "Create Free Account" : "Sign In"}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-[#e8e8e6] dark:border-[#222220]"></div>
              <span className="shrink mx-3 text-[10px] text-[#9ca3af] uppercase tracking-wider">or</span>
              <div className="grow border-t border-[#e8e8e6] dark:border-[#222220]"></div>
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full py-2 px-3 rounded-md border border-[#e8e8e6] dark:border-[#222220] hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sign in with Magic Link</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-xs text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition-colors cursor-pointer underline underline-offset-4"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
);
}
