"use client";
import { useState } from "react";
import type { ThemeConfig } from "@/lib/types";

export default function NewsletterSection({ theme }: { theme?: ThemeConfig }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const title = theme?.newsletter_title ?? "Du fil à retordre… en bonne compagnie";
  const subtitle =
    theme?.newsletter_subtitle ??
    "Recevez chaque mois mes nouveautés, exclusivités et coulisses d’atelier.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="newsletter">
      <span
        className="section__eyebrow section__eyebrow--white"
        style={{ marginBottom: "12px" }}
      >
        Newsletter
      </span>
      <h2 className="newsletter__title">{title}</h2>
      <p className="newsletter__sub">{subtitle}</p>

      {status === "ok" ? (
        <p
          style={{
            color: "rgba(255,255,255,.9)",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "17px",
          }}
        >
          ♥ Merci ! Votre inscription est confirmée.
        </p>
      ) : (
        <form className="newsletter__form" onSubmit={handleSubmit}>
          <input
            className="newsletter__input"
            type="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn--rose"
            disabled={status === "loading"}
          >
            {status === "loading" ? "…" : "Je m’abonne"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: "12px", marginTop: "10px" }}>
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </div>
  );
}
