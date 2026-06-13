import type { Metadata } from "next";
import { getArtisan, getProducts, getProductTaxonomies, getEditorialBlocks } from "@/lib/api";
import { blockData } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import TaxonomySidebar from "@/components/products/TaxonomySidebar";
import TaxonomyFilter from "@/components/products/TaxonomyFilter";
import Link from "next/link";

export const metadata: Metadata = { title: "Boutique" };
export const revalidate = 600;

const PAGE_SIZE = 12;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ terme?: string; page?: string }>;
}) {
  const params = await searchParams;
  const termSlugs = params.terme;
  const page = parseInt(params.page ?? "1", 10);

  const [artisan, taxonomies, products, blocks] = await Promise.all([
    getArtisan(),
    getProductTaxonomies(),
    getProducts({
      page,
      page_size: PAGE_SIZE,
      term_ids: termSlugs,
    }),
    getEditorialBlocks(),
  ]);

  const categoriesTax = taxonomies.find((t) => t.slug === "categories");
  const otherTaxonomies = taxonomies.filter((t) => t.slug !== "categories");

  const boutiqueData = blockData(blocks, "boutique_hero") as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
  };

  const eyebrow = boutiqueData.eyebrow ?? "Collections";
  const totalPages = Math.ceil((products?.total ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number, slugs?: string) => {
    const sp = new URLSearchParams();
    if (slugs) sp.set("terme", slugs);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/boutique${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="page-header-shop">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1 style={{ fontSize: "36px", color: "var(--prune)", margin: 0 }}>
            {boutiqueData.title ?? artisan?.name ?? ""}
          </h1>
          <span className="eyebrow-row eyebrow-row--sable" style={{ flexShrink: 0 }}>
            {eyebrow}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "var(--text-muted)",
            marginBottom: "12px",
          }}
        >
          {boutiqueData.subtitle ?? artisan?.description ?? ""}
        </p>
      </div>

      {/* Bandeaux horizontaux pour les classements autres que catégories */}
      {otherTaxonomies.length > 0 && (
        <div style={{ background: "#fff", padding: "0 40px 20px", borderBottom: "1px solid var(--creme-dark)" }}>
          {otherTaxonomies.map((tax) => (
            <TaxonomyFilter
              key={tax.id}
              taxonomy={tax}
              activeTermSlugs={termSlugs}
            />
          ))}
        </div>
      )}

      {/* Layout : sidebar verticale (catégories) + grille produits */}
      <div className="boutique-layout">
        {categoriesTax && categoriesTax.terms.length > 0 && (
          <aside className="boutique-sidebar">
            <TaxonomySidebar
              taxonomy={categoriesTax}
              activeTermSlug={termSlugs}
            />
          </aside>
        )}

        <section className="section section--creme">
          {products?.items?.length ? (
            <>
              <div className="cards-grid-4" style={{ marginBottom: "40px" }}>
                {products.items.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i === 0} />
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {page > 1 && (
                    <Link
                      href={buildUrl(page - 1, termSlugs)}
                      className="btn btn--outline"
                      style={{ padding: "8px 18px", fontSize: "10px" }}
                    >
                      ← Précédent
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildUrl(p, termSlugs)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1px solid var(--lavande-light)",
                        background: p === page ? "var(--prune)" : "#fff",
                        color: p === page ? "#fff" : "var(--text-muted)",
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={buildUrl(page + 1, termSlugs)}
                      className="btn btn--outline"
                      style={{ padding: "8px 18px", fontSize: "10px" }}
                    >
                      Suivant →
                    </Link>
                  )}
                </div>
              )}
            </>
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
              Aucun produit trouvé pour le moment.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
