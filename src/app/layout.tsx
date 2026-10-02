import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aitalky.vercel.app"),
  title: {
    default: "aitalky — News, Ideas & Analysis in Artificial Intelligence",
    template: "%s | aitalky",
  },
  description:
    "An independent, minimal news publication covering the developments, people, research, and culture of artificial intelligence.",
  keywords: [
    "Artificial Intelligence",
    "AI News",
    "Machine Learning",
    "LLMs",
    "OpenAI",
    "Anthropic",
    "DeepSeek",
    "AI Research",
    "arXiv cs.AI",
    "Generative AI",
    "AI Policy",
  ],
  authors: [{ name: "aitalky Editorial Desk" }],
  creator: "aitalky",
  publisher: "aitalky",
  verification: {
    google: "MS-CkGF-hTsPLdqFwWe67vGvlYhWA1ZoUYXxnJqt2yI",
  },
  alternates: {
    canonical: "https://aitalky.vercel.app",
    types: {
      "text/plain": "https://aitalky.vercel.app/llms.txt",
    },
  },
  other: {
    "google-adsense-account": "ca-pub-5606771623878852",
  },
  icons: {
    icon: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "aitalky — Independent AI Journalism",
    description: "Factual, minimal reporting on artificial intelligence research, models, and policy.",
    url: "https://aitalky.vercel.app",
    siteName: "aitalky",
    locale: "en_US",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630, alt: "aitalky Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "aitalky — News, Ideas & Analysis",
    description: "Independent artificial intelligence journalism. Updated every 30 minutes.",
    images: ["/logo.svg"],
    creator: "@aitalkynews",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0c" },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": "https://aitalky.vercel.app/#organization",
      "name": "aitalky",
      "url": "https://aitalky.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aitalky.vercel.app/logo.svg",
      },
      "description":
        "An independent, minimal news publication covering artificial intelligence research, industry, models, and policy.",
      "knowsAbout": [
        "Artificial Intelligence",
        "Machine Learning",
        "Large Language Models",
        "Deep Learning",
        "Neural Networks",
        "AI Agents",
        "Robotics",
      ],
      "publishingPrinciples": "https://aitalky.vercel.app",
    },
    {
      "@type": "WebSite",
      "@id": "https://aitalky.vercel.app/#website",
      "url": "https://aitalky.vercel.app",
      "name": "aitalky",
      "publisher": {
        "@id": "https://aitalky.vercel.app/#organization",
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://aitalky.vercel.app/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="alternate" type="text/plain" href="https://aitalky.vercel.app/llms.txt" title="LLMs.txt" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5606771623878852"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {children}
      </body>
    </html>
  );
}
