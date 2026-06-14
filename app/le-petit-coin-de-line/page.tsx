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

  return (
    <div>
      {/* Hero deux colonnes : texte à gauche, portrait à droite */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "520px",
        }}
      >
        {/* Colonne gauche — texte + coin_url */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--lavande-pale)",
            padding: "56px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
                sizes="50vw"
                priority
                className="object-contain"
                style={{ objectPosition: "bottom left" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top right, transparent 30%, var(--lavande-pale) 70%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          )}
          <div style={{ position: "relative", zIndex: 1, maxWidth: "440px" }}>
            {heroData.eyebrow && (
              <span
                className="eyebrow-row"
                style={{ display: "block", marginBottom: "12px" }}
              >
                {heroData.eyebrow}
              </span>
            )}
            <h1
              style={{
                fontSize: "38px",
                color: "var(--prune)",
                lineHeight: 1.2,
                margin: "0 0 14px",
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
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {heroData.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Colonne droite — portrait photo_url */}
        {heroData.photo_url && (
          <div
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Image
              src={heroData.photo_url}
              alt=""
              fill
              sizes="50vw"
              priority
              className="object-cover"
            />
          </div>
        )}
      </section>

      {/* Grille produits 2x4 */}
      <section style={{ padding: "40px", background: "var(--creme)" }}>
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
      </section>
    </div>
  );
}
