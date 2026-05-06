import type { Metadata } from "next";
import { getBlogPosts, getArtisan } from "@/lib/api";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import ArticleCard from "@/components/blog/ArticleCard";
import NewsletterSection from "@/components/home/NewsletterSection";
import Link from "next/link";

export const metadata: Metadata = { title: "Blog" };
export const revalidate = 600;

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tag = params.tag;
  const page = parseInt(params.page ?? "1", 10);

  const [artisan, posts] = await Promise.all([
    getArtisan(),
    getBlogPosts({ page, page_size: PAGE_SIZE + 1, tag }),
  ]);

  const theme = artisan?.theme_config ?? {};

  const allPosts = posts?.items ?? [];
  const featured = page === 1 && !tag ? allPosts[0] : null;
  const list = featured ? allPosts.slice(1) : allPosts;
  const total = posts?.total ?? 0;
  const totalPages = Math.ceil((total - (featured ? 1 : 0)) / PAGE_SIZE);

  // Tags uniques collectés depuis les articles
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags)));

  return (
    <>
      {/* Hero blog */}
      <div
        style={{
          background: "#fff",
          padding: "56px 40px",
          textAlign: "center",
          borderBottom: "1px solid var(--creme-dark)",
        }}
      >
        <span className="section__eyebrow">Le journal de l’atelier</span>
        <h1
          style={{
            fontSize: "38px",
            color: "var(--prune)",
            marginBottom: "12px",
          }}
        >
          Inspirations &amp; Coulisses
        </h1>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "17px",
            color: "var(--text-muted)",
            maxWidth: "520px",
            margin: "0 auto 28px",
            lineHeight: 1.7,
          }}
        >
          {artisan?.description
            ? `Tutoriels, conseils, coulisses — bienvenue dans l’univers de ${artisan.name}.`
            : "Tutoriels, conseils crochet, coulisses d’atelier — bienvenue dans mon univers."}
        </p>

        {/* Filtres par tag */}
        {allTags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/blog"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                padding: "8px 18px",
                borderRadius: "30px",
                border: "1px solid var(--lavande-light)",
                background: !tag ? "var(--prune)" : "#fff",
                color: !tag ? "#fff" : "var(--text-muted)",
              }}
            >
              Tous
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "9px",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  padding: "8px 18px",
                  borderRadius: "30px",
                  border: "1px solid var(--lavande-light)",
                  background: tag === t ? "var(--prune)" : "#fff",
                  color: tag === t ? "#fff" : "var(--text-muted)",
                }}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Article à la une */}
      {featured && (
        <section className="section section--creme">
          <p
            className="eyebrow-row eyebrow-row--sable"
            style={{ marginBottom: "20px" }}
          >
            Article à la une
          </p>
          <FeaturedArticle post={featured} />
        </section>
      )}

      {/* Grille articles */}
      {list.length > 0 && (
        <section className="section section--white">
          <p
            className="eyebrow-row eyebrow-row--sable"
            style={{ marginBottom: "22px" }}
          >
            {featured ? "Derniers articles" : "Articles"}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
              marginBottom: totalPages > 1 ? "32px" : 0,
            }}
          >
            {list.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
                  className="btn btn--outline"
                  style={{ padding: "8px 18px", fontSize: "10px" }}
                >
                  ← Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/blog?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
                  className="btn btn--outline"
                  style={{ padding: "8px 18px", fontSize: "10px" }}
                >
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {list.length === 0 && !featured && (
        <section className="section section--white" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "18px" }}>
            Aucun article pour le moment.
          </p>
        </section>
      )}

      <NewsletterSection theme={theme} />
    </>
  );
}
