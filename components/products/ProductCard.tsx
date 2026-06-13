import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice, coverImage, stripMarkdown } from "@/lib/utils";

function getBadge(product: Product): { label: string; cls: string } | null {
  if (product.is_featured) return { label: "Coup de ♥", cls: "badge--fav" };
  const age = product.published_at
    ? (Date.now() - new Date(product.published_at).getTime()) / 86400000
    : Infinity;
  if (age < 14) return { label: "Nouveauté", cls: "badge--new" };
  return null;
}

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const badge = getBadge(product);
  const img = coverImage(product.images);

  return (
    <Link href={`/boutique/${product.slug}`} className="product-card">
      <div className="product-card__img" style={{ background: "var(--lavande-pale)" }}>
        {img ? (
          <div style={{ position: "absolute", inset: "16px 8px" }}>
            <Image
              src={img}
              alt={product.images.find((i) => i.is_cover)?.alt_text ?? product.name}
              fill
              className="object-contain"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
            />
          </div>
        ) : (
          <span style={{ fontSize: "56px" }}>🧶</span>
        )}
        {badge && (
          <span className={`product-card__badge badge ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {product.taxonomy_terms.filter(t => t.emoji).length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {product.taxonomy_terms.filter(t => t.emoji).map((term) => (
              <span
                key={term.id}
                title={term.name}
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.85)",
                  boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                }}
              >
                {term.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__desc">
          {product.short_description ? stripMarkdown(product.short_description) : ""}
        </p>
        <div className="product-card__footer">
          <span className="product-card__price">
            {product.price_on_request
              ? "Prix sur demande"
              : formatPrice(product.price)}
          </span>
          <span className="product-card__btn">Voir →</span>
        </div>
      </div>
    </Link>
  );
}
