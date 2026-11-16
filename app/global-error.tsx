// File: app/global-error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global critical error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 0, backgroundColor: "#09090b", color: "#fafafa" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ maxWidth: "450px", textAlign: "center", background: "#18181b", padding: "32px", borderRadius: "12px", border: "1px solid #27272a" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 12px 0", color: "#f43f5e" }}>
              Critical Application Error
            </h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              A critical infrastructure error occurred in the application shell. Please refresh or try again shortly.
            </p>
            {error.digest && (
              <p style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace", margin: "0 0 20px 0" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#e11d48",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
