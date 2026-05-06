import type { Metadata } from "next";
import { getArtisan, getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import CategoryFilter from "@/components/products/CategoryFilter";
import Link from "next/link";

export const metadata: Metadata = { title: "Boutique" };
export const revalidate = 600;

const PAGE_SIZE = 9;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.categorie;
  const page = parseInt(params.page ?? "1", 10);

  const [artisan, categories, products] = await Promise.all([
    getArtisan(),
    getCategories(),
    getProducts({
      page,
      page_size: PAGE_SIZE,
      category_slug: categorySlug,
    }),
  ]);

  const theme = artisan?.theme_config ?? {};
  const totalPages = Math.ceil((products?.total ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number, cat?: string) => {
    const sp = new URLSearchParams();
    if (cat) sp.set("categorie", cat);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/boutique${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {/* En-tête boutique */}
      <div
        style={{
          background: "#fff",
          padding: "48px 40px 32px",
          borderBottom: "1px solid var(--creme-dark)",
        }}
      >
        <span className="eyebrow-row eyebrow-row--sable">
          {theme.featured_eyebrow ?? "Collections"}
        </span>
        <h1 style={{ fontSize: "36px", color: "var(--prune)", marginBottom: "8px" }}>
          {artisan?.name ?? ""}
        </h1>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "var(--text-muted)",
            marginBottom: "28px",
          }}
        >
          {artisan?.description ?? ""}
        </p>

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            activeSlug={categorySlug}
          />
        )}
      </div>

      {/* Grille produits */}
      <section className="section section--creme">
        {products?.items?.length ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "18px",
                marginBottom: "40px",
              }}
            >
              {products.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
                    href={buildUrl(page - 1, categorySlug)}
                    className="btn btn--outline"
                    style={{ padding: "8px 18px", fontSize: "10px" }}
                  >
                    ← Précédent
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildUrl(p, categorySlug)}
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
                    href={buildUrl(page + 1, categorySlug)}
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
            Aucun produit dans cette catégorie pour le moment.
          </p>
        )}
      </section>
    </>
  );
}
