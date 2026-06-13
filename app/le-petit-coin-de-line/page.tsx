import type { Metadata } from "next";
import Image from "next/image";
import { getArtisan, getProducts, getEditorialBlocks } from "@/lib/api";
import { blockData } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = { title: "Le Petit Coin de Line" };
export const revalidate = 600;

const TERM_SLUG = "le-petit-coin-de-line";

export default async function PetitCoinPage() {
  const [artisan, blocks] = await Promise.all([
    getArtisan(),
    getEditorialBlocks(),
  ]);

  const heroData = blockData(blocks, "le-petit-coin-de-line_hero") as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    coin_url?: string;
  };

  const themeData = blockData(blocks, "le-petit-coin-de-line_theme") as {
    primary_color?: string;
    accent_color?: string;
    background_color?: string;
  } | null;

  const products = await getProducts({
    term_ids: TERM_SLUG,
    include_excluded: true,
    page_size: 100,
  });

  const pc = themeData?.primary_color ?? "var(--prune)";
  const bg = themeData?.background_color ?? "var(--creme)";

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: bg,
          padding: heroData.coin_url ? "0" : "56px 40px",
        }}
      >
        {heroData.coin_url ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "360px",
              display: "flex",
              alignItems: "flex-end",
              padding: "40px",
            }}
          >
            <Image
              src={heroData.coin_url}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 50%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, color: "#fff" }}>
              {heroData.eyebrow && (
                <span
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "10px",
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {heroData.eyebrow}
                </span>
              )}
              <h1 style={{ fontSize: "38px", fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
                {heroData.title ?? "Le Petit Coin de Line"}
              </h1>
              {heroData.subtitle && (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: "17px",
                    opacity: 0.9,
                    margin: "8px 0 0",
                    maxWidth: "520px",
                  }}
                >
                  {heroData.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {heroData.eyebrow && (
              <span
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "10px",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {heroData.eyebrow}
              </span>
            )}
            <h1 style={{ fontSize: "36px", color: pc, margin: 0, lineHeight: 1.2 }}>
              {heroData.title ?? "Le Petit Coin de Line"}
            </h1>
            {heroData.subtitle && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  marginTop: "10px",
                  maxWidth: "600px",
                }}
              >
                {heroData.subtitle}
              </p>
            )}
          </>
        )}
      </section>

      {/* Grille produits */}
      <section
        className="section"
        style={{ background: bg }}
      >
        {products?.items?.length ? (
          <div className="cards-grid-4" style={{ padding: "0 40px 40px" }}>
            {products.items.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "18px",
              padding: "60px 0",
            }}
          >
            Aucun produit pour le moment.
          </p>
        )}
      </section>
    </div>
  );
}
