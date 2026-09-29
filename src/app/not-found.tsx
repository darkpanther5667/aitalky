import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#f4f4f2] dark:bg-[#1a1a18] flex items-center justify-center mx-auto text-[#141413] dark:text-[#f3f3f0]">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#141413] dark:text-[#f3f3f0]">
          Story Not Found
        </h1>
        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
          The requested dispatch may have been moved, updated, or does not exist in the active newsroom wire.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Front Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
