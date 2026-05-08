import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice, coverImage } from "@/lib/utils";

function getBadge(product: Product): { label: string; cls: string } | null {
  if (product.is_featured) return { label: "Coup de ♥", cls: "badge--fav" };
  const age = product.published_at
    ? (Date.now() - new Date(product.published_at).getTime()) / 86400000
    : Infinity;
  if (age < 14) return { label: "Nouveauté", cls: "badge--new" };
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const badge = getBadge(product);
  const img = coverImage(product.images);

  return (
    <Link href={`/boutique/${product.slug}`} className="product-card">
      <div className="product-card__img" style={{ background: "var(--lavande-pale)" }}>
        {img ? (
          <Image
            src={img}
            alt={product.images.find((i) => i.is_cover)?.alt_text ?? product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span style={{ fontSize: "56px" }}>🧶</span>
        )}
        {badge && (
          <span className={`product-card__badge badge ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__desc">
          {product.short_description || product.description?.slice(0, 80)}
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
