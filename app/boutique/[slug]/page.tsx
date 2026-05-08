import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getCategories, getArtisan } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ProductGallery from "@/components/products/ProductGallery";
import ProductCard from "@/components/products/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, artisan, categories, similar] = await Promise.all([
    getProduct(slug),
    getArtisan(),
    getCategories(),
    getProducts({ page_size: 3, is_featured: true }),
  ]);

  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category_id);
  const price = formatPrice(product.price);
  const comparePrice = product.compare_at_price
    ? formatPrice(product.compare_at_price)
    : null;
  const similarProducts = similar?.items?.filter((p) => p.id !== product.id).slice(0, 3) ?? [];
  const hasDimensions = Object.keys(product.dimensions).length > 0;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Boutique", href: "/boutique" },
          ...(category ? [{ label: category.name, href: `/boutique?categorie=${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      {/* Layout produit : 1/3 image fixe | 2/3 informations défilables */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          height: "calc(100vh - 64px)",
          minHeight: "560px",
          background: "#fff",
        }}
      >
        {/* Colonne image — fixe, hauteur pleine */}
        <div
          style={{
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid var(--creme-dark)",
          }}
        >
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Colonne informations — défilable */}
        <div
          style={{
            height: "100%",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Informations produit */}
          <div
            style={{
              padding: "40px 44px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {category && (
              <span className="eyebrow-row eyebrow-row--sable">
                {category.name} · Fait main
              </span>
            )}
            <h1
              style={{
                fontSize: "30px",
                color: "var(--prune)",
                lineHeight: 1.2,
                marginBottom: "6px",
              }}
            >
              {product.name}
            </h1>
            {product.short_description && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  marginBottom: "20px",
                }}
              >
                {product.short_description}
              </p>
            )}

            {/* Prix */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {product.price_on_request ? (
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    color: "var(--text-muted)",
                  }}
                >
                  Prix sur demande
                </span>
              ) : (
                <>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "34px",
                      color: "var(--prune)",
                    }}
                  >
                    {price}
                  </span>
                  {comparePrice && (
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "20px",
                        color: "var(--text-muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      {comparePrice}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "24px",
                }}
              >
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "9px",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      background: "var(--lavande-pale)",
                      color: "var(--prune)",
                      padding: "5px 14px",
                      borderRadius: "30px",
                      border: "1px solid var(--lavande-light)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contact pour commande */}
            {artisan?.contact?.email && (
              <a
                href={`mailto:${artisan.contact.email}?subject=Commande : ${product.name}`}
                className="btn btn--primary"
                style={{ marginBottom: "20px", textAlign: "center" }}
              >
                Commander ce produit
              </a>
            )}

            {/* Infos livraison */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ fontSize: "16px" }}>📦</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Expédié en 3–5 jours</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ fontSize: "16px" }}>🇫🇷</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fabriqué en France</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ fontSize: "16px" }}>✅</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fait à la main</span>
              </div>
            </div>
          </div>

          {/* Description complète — déplacée dans la colonne droite */}
          {(product.description || hasDimensions) && (
            <div
              style={{
                padding: "40px 44px",
                background: "var(--creme)",
                borderTop: "1px solid var(--creme-dark)",
                display: "grid",
                gridTemplateColumns: hasDimensions ? "1fr 1fr" : "1fr",
                gap: "32px",
                alignItems: "start",
              }}
            >
              {product.description && (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              {hasDimensions && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid var(--creme-dark)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "10px",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--sable)",
                      marginBottom: "16px",
                    }}
                  >
                    Dimensions
                  </p>
                  {Object.entries(product.dimensions).map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--creme-dark)",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>{k}</span>
                      <span style={{ color: "var(--prune)", fontWeight: 500 }}>
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      {similarProducts.length > 0 && (
        <section className="section section--white">
          <div className="section__header">
            <span className="section__eyebrow">Dans la même veine</span>
            <h2 className="section__title">Vous aimerez aussi…</h2>
            <div className="section__line" />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
            }}
          >
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
