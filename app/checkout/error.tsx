"use client";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "28px",
          color: "var(--prune)",
          marginBottom: "32px",
        }}
      >
        Erreur
      </h1>
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          fontSize: "14px",
          marginBottom: "24px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "8px" }}>
          Une erreur est survenue lors du chargement de la page.
        </p>
        <p style={{ fontFamily: "monospace", fontSize: "12px", margin: 0 }}>
          {error.message}
        </p>
        {error.digest && (
          <p style={{ fontFamily: "monospace", fontSize: "11px", marginTop: "8px", color: "#999" }}>
            Digest: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="btn btn--primary"
        style={{ width: "100%", padding: "14px 28px", fontSize: "13px" }}
      >
        Réessayer
      </button>
    </div>
  );
}
