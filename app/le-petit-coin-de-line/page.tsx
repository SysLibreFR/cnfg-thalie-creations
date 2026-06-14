import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArtisan, getProducts, getEditorialBlocks } from "@/lib/api";
import { blockData, initials } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = { title: "Le Petit Coin de Line" };
export const revalidate = 600;

const TERM_SLUG = "le-petit-coin-de-line";
const PAGE_SIZE = 6;

export default async function PetitCoinPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const [artisan, blocks] = await Promise.all([
    getArtisan(),
    getEditorialBlocks(),
  ]);

  const heroData = blockData(blocks, "le_petit_coin_de_line_hero2") as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    photo_url?: string;
    signature_name?: string;
    signature_role?: string;
    coin_url?: string;
  };

  const products = await getProducts({
    term_ids: TERM_SLUG,
    include_excluded: true,
    page,
    page_size: PAGE_SIZE,
  });

  const totalPages = Math.ceil((products?.total ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/le-petit-coin-de-line${qs ? `?${qs}` : ""}`;
  };

  const sigName = heroData.signature_name ?? artisan?.name?.split(" ")[0] ?? "Line";
  const sigRole =
    heroData.signature_role ??
    (artisan?.theme_config?.artisan_role as string | undefined) ??
    "Créatrice & artisane";

  return (
    <div style={{ background: "var(--creme)" }}>
      {/* Hero avec image de coin */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#fff",
          padding: "56px 40px",
        }}
      >
        {heroData.coin_url && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <Image
              src={heroData.coin_url}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-contain"
              style={{ objectPosition: "top right" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top right, #fff 30%, #fff 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
          {heroData.eyebrow && (
            <span
              className="eyebrow-row"
              style={{ display: "block", marginBottom: "10px" }}
            >
              {heroData.eyebrow}
            </span>
          )}
          <h1
            style={{
              fontSize: "38px",
              color: "var(--prune)",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {heroData.title ?? "Le Petit Coin de Line"}
          </h1>
          {heroData.subtitle && (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "17px",
                color: "var(--text-muted)",
                marginTop: "12px",
                maxWidth: "480px",
              }}
            >
              {heroData.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Contenu : portrait + grille produits */}
      <section style={{ padding: "40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Colonne gauche — portrait + signature */}
          <div
            style={{
              position: "sticky",
              top: "104px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {heroData.photo_url && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "var(--lavande-pale)",
                  marginBottom: "20px",
                }}
              >
                <Image
                  src={heroData.photo_url}
                  alt={sigName}
                  fill
                  className="object-cover"
                  sizes="320px"
                  priority
                />
              </div>
            )}
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "22px",
                color: "var(--prune)",
                margin: "0 0 4px",
              }}
            >
              {sigName}
            </p>
            <p
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              {sigRole}
            </p>
          </div>

          {/* Colonne droite — grille produits */}
          <div>
            {products?.items?.length ? (
              <>
                <div className="cards-grid-2" style={{ marginBottom: "32px" }}>
                  {products.items.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={i === 0 && page === 1}
                    />
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
                        href={buildUrl(page - 1)}
                        className="btn btn--outline"
                        style={{ padding: "8px 18px", fontSize: "10px" }}
                      >
                        ← Précédent
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={buildUrl(p)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            border: "1px solid var(--lavande-light)",
                            background:
                              p === page ? "var(--prune)" : "#fff",
                            color:
                              p === page
                                ? "#fff"
                                : "var(--text-muted)",
                            fontFamily: "'Josefin Sans', sans-serif",
                            fontSize: "11px",
                          }}
                        >
                          {p}
                        </Link>
                      )
                    )}
                    {page < totalPages && (
                      <Link
                        href={buildUrl(page + 1)}
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
                  padding: "60px 0",
                }}
              >
                Aucun produit pour le moment.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
