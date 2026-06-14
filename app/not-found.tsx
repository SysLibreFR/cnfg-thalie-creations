import Link from "next/link";
import { getArtisan, getProducts } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";

export default async function NotFound() {
  const [artisan, featured] = await Promise.all([
    getArtisan(),
    getProducts({ is_featured: true, include_excluded: true, page_size: 4 }),
  ]);

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "80px 20px 60px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "10px",
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "var(--sable)",
          display: "block",
          marginBottom: "8px",
        }}
      >
        Erreur 404
      </span>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "36px",
          color: "var(--prune)",
          margin: "0 0 12px",
          lineHeight: 1.2,
        }}
      >
        Page introuvable
      </h1>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "17px",
          color: "var(--text-muted)",
          margin: "0 0 32px",
        }}
      >
        Désolée, cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="btn btn--primary"
        style={{ padding: "14px 28px", fontSize: "11px" }}
      >
        Retour à l&apos;accueil
      </Link>

      {featured?.items?.length ? (
        <section style={{ marginTop: "64px", textAlign: "left" }}>
          <h2
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "10px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--sable)",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Découvrez nos coups de cœur
          </h2>
          <div className="cards-grid-4">
            {featured.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <p
          style={{
            marginTop: "40px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "var(--text-muted)",
          }}
        >
          En attendant, vous pouvez visiter notre{" "}
          <Link href="/boutique" style={{ color: "var(--prune)" }}>
            boutique
          </Link>
          .
        </p>
      )}
    </div>
  );
}
