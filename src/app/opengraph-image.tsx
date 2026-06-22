import { ImageResponse } from "next/og";

export const alt =
  "Beacon — Digital Health Passport & Emergency Medical ID";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #115e59 0%, #0d9488 55%, #0f766e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.18)",
              fontSize: "40px",
            }}
          >
            ♥
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Beacon
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            Your medical story, ready the moment it matters.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Encrypted health passport · one QR code · every access logged
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "24px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <div style={{ display: "flex" }}>Digital Health Passport</div>
          <div style={{ display: "flex" }}>Emergency Medical ID</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
