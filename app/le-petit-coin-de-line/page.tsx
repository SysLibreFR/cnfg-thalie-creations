import type { Metadata } from "next";
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
  };

  const products = await getProducts({
    term_ids: TERM_SLUG,
    include_excluded: true,
    page_size: 100,
  });

  return (
    <>
      <div className="page-header-shop">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1
            style={{
              fontSize: "36px",
              color: "var(--prune)",
              margin: 0,
            }}
          >
            {heroData.title ?? "Le Petit Coin de Line"}
          </h1>
          {heroData.eyebrow && (
            <span className="eyebrow-row eyebrow-row--sable" style={{ flexShrink: 0 }}>
              {heroData.eyebrow}
            </span>
          )}
        </div>
        {heroData.subtitle && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "16px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            {heroData.subtitle}
          </p>
        )}
      </div>

      <section className="section section--creme">
        {products?.items?.length ? (
          <div className="cards-grid-4">
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
              padding: "40px 0",
            }}
          >
            Aucun produit pour le moment.
          </p>
        )}
      </section>
    </>
  );
}
