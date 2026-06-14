import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArtisan, getProducts, getEditorialBlocks } from "@/lib/api";
import { blockData } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = { title: "Le Petit Coin de Line" };
export const revalidate = 600;

const TERM_SLUG = "le-petit-coin-de-line";
const PAGE_SIZE = 8;

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

  const themeData = blockData(blocks, "le_petit_coin_de_line_theme") as {
    primary_color?: string;
    accent_color?: string;
    background_color?: string;
  } | null;

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
    <div>
      <section
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* coin_url en fond sur les deux colonnes */}
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
              className="object-cover"
            />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(248,246,248,.95) 0%, rgba(248,246,248,.7) 30%, transparent 55%)",
                  pointerEvents: "none",
                }}
              />
          </div>
        )}

        {/* Colonne gauche — portrait */}
        {heroData.photo_url && (
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "transparent",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <Image
                src={heroData.photo_url}
                alt={sigName}
                fill
                sizes="50vw"
                priority
                className="object-contain"
                style={{ objectPosition: "center center", padding: "20px" }}
              />
            </div>
          </div>
        )}

        {/* Colonne droite — contenu + produits */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "rgba(255,255,255,.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,.3)",
              padding: "36px 40px",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            {/* Ligne 1 — titre + sous-titre */}
            <div>
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
                  fontSize: "34px",
                  color: themeData?.primary_color ?? "var(--prune)",
                  lineHeight: 1.2,
                  margin: "0 0 10px",
                }}
              >
                {heroData.title ?? "Le Petit Coin de Line"}
              </h1>
              {heroData.subtitle && (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: "16px",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    margin: "0 0 24px",
                    maxWidth: "480px",
                  }}
                >
                  {heroData.subtitle}
                </p>
              )}
            </div>

            {/* Ligne 2 — grille produits 2x4 */}
            <div style={{ flex: 1 }}>
              {products?.items?.length ? (
                <div className="cards-grid-2">
                  {products.items.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={i === 0 && page === 1}
                    />
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
            </div>

            {/* Ligne 3 — navigation */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  paddingTop: "24px",
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
                        background: p === page ? "var(--prune)" : "#fff",
                        color: p === page ? "#fff" : "var(--text-muted)",
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
          </div>
        </div>
      </section>
    </div>
  );
}
