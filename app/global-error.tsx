"use client";

/**
 * Shown only when the root layout itself fails, so it cannot rely on the app
 * stylesheet. Everything here is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070a",
          color: "#f4f4f6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 24,
            }}
          >
            {[14, 26, 34, 20, 12].map((h, i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: h,
                  borderRadius: 3,
                  background: i % 2 === 0 ? "#7cf7d0" : "#b8a6ff",
                }}
              />
            ))}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>
            The rhythm dropped a beat.
          </h1>
          <p style={{ fontSize: 14, color: "#a3a3ad", margin: "0 0 20px" }}>
            Cadence hit an unexpected error. Reloading usually clears it.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#5a5b66",
                margin: "0 0 20px",
              }}
            >
              ref {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: 4,
              background: "#7cf7d0",
              color: "#04120d",
              padding: "10px 20px",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
