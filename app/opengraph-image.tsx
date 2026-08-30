import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Cadence - find your typing rhythm";
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
          background: "#07070a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          {[70, 130, 190, 150, 90].map((h, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: h,
                borderRadius: 9,
                background: i % 2 === 0 ? "#7cf7d0" : "#b8a6ff",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "#f4f4f6",
              letterSpacing: -2,
            }}
          >
            Cadence
          </div>
          <div style={{ fontSize: 34, color: "#a3a3ad" }}>
            Type to a tempo. Tune out the rest.
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#5a5b66",
            textTransform: "uppercase",
            letterSpacing: 6,
          }}
        >
          Focus first typing trainer
        </div>
      </div>
    ),
    size,
  );
}
