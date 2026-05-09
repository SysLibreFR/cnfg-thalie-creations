import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getCategories, getArtisan, getFieldSchema } from "@/lib/api";
import type { FieldSchemaDef } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProductGallery from "@/components/products/ProductGallery";
import ProductCard from "@/components/products/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { marked } from "marked";

export const revalidate = 300;

function isFieldVisible(
  field: FieldSchemaDef,
  fieldDefs: FieldSchemaDef[],
  customFields: Record<string, unknown>
): boolean {
  if (!field.conditional_on_field_id) return true;
  const dep = fieldDefs.find((f) => f.id === field.conditional_on_field_id);
  if (!dep) return true;
  return String(customFields[dep.name] ?? "") === field.conditional_on_value;
}

function getFieldDisplayValue(field: FieldSchemaDef, customFields: Record<string, unknown>): string | null {
  const raw = customFields[field.name];
  if (raw === undefined || raw === null || raw === "") return null;
  switch (field.field_type) {
    case "boolean":
      return raw === true || raw === "true" ? field.label : null;
    case "select": {
      const opt = field.options.find((o) => o.value === String(raw));
      return opt ? opt.label : String(raw);
    }
    case "multiselect": {
      const vals = Array.isArray(raw) ? raw : String(raw).split(",");
      return vals.map((v: string) => field.options.find((o) => o.value === v.trim())?.label ?? v.trim()).join(", ");
    }
    default:
      return String(raw);
  }
}

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

  const [product, artisan, categories, similar, fieldSchema] = await Promise.all([
    getProduct(slug),
    getArtisan(),
    getCategories(),
    getProducts({ page_size: 3, is_featured: true }),
    getFieldSchema(),
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

      {/* Layout produit : galerie | informations */}
      <div className="product-page-layout">
        {/* Colonne image */}
        <div
          className="product-gallery-col"
          style={{
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid var(--creme-dark)",
          }}
        >
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Colonne informations */}
        <div
          className="product-info-col"
          style={{
            height: "100%",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Informations produit */}
          <div
            className="product-info-pad"
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

            {/* Champs personnalisés produit */}
            {fieldSchema.length > 0 ? (
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {fieldSchema
                  .filter((f) => f.field_type !== "image" && f.field_type !== "file")
                  .filter((f) => isFieldVisible(f, fieldSchema, product.custom_fields))
                  .map((f) => {
                    const display = getFieldDisplayValue(f, product.custom_fields);
                    if (!display) return null;
                    return (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {f.field_type === "boolean" ? display : `${f.label} : ${display}`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
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
            )}
          </div>

          {/* Description complète */}
          {(product.description || hasDimensions) && (
            <div
              className="product-desc-grid"
              style={{
                padding: "40px 44px",
                background: "var(--creme)",
                borderTop: "1px solid var(--creme-dark)",
                gridTemplateColumns: hasDimensions ? "1fr 1fr" : "1fr",
              }}
            >
              {product.description && (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: marked(product.description) as string }}
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
          <div className="cards-grid-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
