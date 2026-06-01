import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>✨</div>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "28px",
          color: "var(--prune)",
          marginBottom: "16px",
        }}
      >
        Votre commande est confirmée&nbsp;!
      </h1>
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "8px",
          lineHeight: 1.7,
        }}
      >
        Vous allez recevoir un email de confirmation avec un lien de suivi.
      </p>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "14px",
          marginBottom: "32px",
        }}
      >
        L&apos;artisane vous tiendra informé de l&apos;avancement de votre commande.
      </p>
      <Link href="/boutique" className="btn btn--primary">
        Retour à la boutique
      </Link>
    </div>
  );
}
