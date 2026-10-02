import { ImageResponse } from "next/og";

export const alt = "aitalky — Independent AI News, Research & Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#f3f3f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 800,
                color: "#0d0d0c",
              }}
            >
              a
            </div>
            <span
              style={{
                fontSize: "36px",
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
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "20px",
              backgroundColor: "#161614",
              border: "1px solid #262624",
              fontSize: "15px",
              fontWeight: 600,
              color: "#10b981",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ● Live AI Wire
          </div>
        </div>

        {/* Headline / Value Proposition */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#f3f3f0",
            }}
          >
            Real-Time AI News & Research Aggregator
          </div>
          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.4,
              color: "#9ca3af",
              fontWeight: 400,
            }}
          >
            Frontier models, machine learning preprints, compute economics, and algorithmic policy.
          </div>
        </div>

        {/* Footer Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #222220",
            paddingTop: "32px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          <div style={{ display: "flex", gap: "30px" }}>
            <span>• Industry</span>
            <span>• Research</span>
            <span>• Products</span>
            <span>• Policy</span>
            <span>• Culture</span>
          </div>
          <span style={{ color: "#9ca3af", fontWeight: 500 }}>aitalky.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
