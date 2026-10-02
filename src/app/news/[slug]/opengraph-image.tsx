import { ImageResponse } from "next/og";
import { getDbArticleBySlug } from "@/lib/db";
import { getArticleBySlug } from "@/lib/rss-sources";

export const alt = "aitalky Article Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  let article = null;
  try {
    article = await getDbArticleBySlug(slug);
  } catch {}

  if (!article) {
    try {
      article = await getArticleBySlug(slug);
    } catch {}
  }

  const title = article?.title || "Frontier AI News & Intelligence";
  const source = article?.source || "aitalky Wire";
  const category = (article?.category || "industry").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d0d0c",
          padding: "70px 80px",
          fontFamily: "sans-serif",
          color: "#f3f3f0",
          border: "1px solid #222220",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#f3f3f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#0d0d0c",
              }}
            >
              a
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              aitalky
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "16px",
              backgroundColor: "#1c1c1a",
              border: "1px solid #333330",
              fontSize: "14px",
              fontWeight: 700,
              color: "#38bdf8",
              letterSpacing: "0.08em",
            }}
          >
            {category}
          </div>
        </div>

        {/* Article Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "1000px",
            margin: "auto 0",
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? "46px" : "56px",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            {title}
          </div>
        </div>

        {/* Source & Attribution Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #222220",
            paddingTop: "28px",
            fontSize: "19px",
            color: "#9ca3af",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#6b7280" }}>Primary Reporting:</span>
            <span style={{ fontWeight: 600, color: "#f3f3f0" }}>{source}</span>
          </div>
          <span style={{ color: "#71717a", fontSize: "16px" }}>aitalky.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
