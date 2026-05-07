import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts, getArtisan } from "@/lib/api";
import { formatDate, readTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/blog/ArticleCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import NewsletterSection from "@/components/home/NewsletterSection";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post, artisan, related] = await Promise.all([
    getBlogPost(slug),
    getArtisan(),
    getBlogPosts({ page_size: 4 }),
  ]);

  if (!post) notFound();

  const theme = artisan?.theme_config ?? {};
  const relatedPosts = related?.items?.filter((p) => p.slug !== slug).slice(0, 3) ?? [];
  const minutes = readTime(post.content);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Blog", href: "/blog" },
          ...(post.tags[0] ? [{ label: post.tags[0], href: `/blog?tag=${post.tags[0]}` }] : []),
          { label: post.title },
        ]}
      />

      {/* En-tête article */}
      <div
        style={{
          background: "#fff",
          padding: "44px 40px 0",
        }}
      >
        <div className="article-meta" style={{ marginBottom: "18px" }}>
          {post.tags[0] && <span className="article-meta__cat">{post.tags[0]}</span>}
          <span className="article-meta__date">{formatDate(post.published_at)}</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            ⏱ {minutes} min de lecture
          </span>
        </div>
        <h1
          style={{
            fontSize: "38px",
            color: "var(--prune)",
            lineHeight: 1.2,
            maxWidth: "680px",
            marginBottom: "14px",
          }}
        >
          {post.title}
        </h1>
        {post.excerpt && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "19px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              maxWidth: "620px",
              marginBottom: "28px",
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Barre auteur */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 0",
            borderTop: "1px solid var(--creme-dark)",
            borderBottom: "1px solid var(--creme-dark)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--lavande-pale)",
              border: "2px solid var(--lavande-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {artisan?.logo_url ? (
              <Image src={artisan.logo_url} alt={artisan.name} fill className="object-cover" />
            ) : (
              <span>🧶</span>
            )}
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--prune)",
              }}
            >
              {artisan?.name ?? ""}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {(theme.artisan_role as string) ?? "Créatrice & artisane"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <span
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Partager
            </span>
            {artisan?.contact?.instagram && (
              <a
                href={artisan.contact.instagram as string}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid var(--lavande-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                }}
              >
                📷
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Image de couverture */}
      {post.cover_url && (
        <div
          style={{
            background: "var(--lavande-pale)",
            height: "280px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Contenu + Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "48px",
          padding: "44px 40px 52px",
          alignItems: "start",
          background: "#fff",
        }}
      >
        {/* Corps */}
        <article
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sidebar */}
        <aside>
          {/* Articles récents */}
          {relatedPosts.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "22px 20px",
                border: "1px solid var(--creme-dark)",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "10px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--sable)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "18px",
                }}
              >
                <span style={{ width: "14px", height: "1px", background: "var(--sable)", display: "inline-block" }} />
                Articles récents
              </p>
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "14px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid var(--creme-dark)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "8px",
                      background: "var(--lavande-pale)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      flexShrink: 0,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {p.cover_url ? (
                      <Image src={p.cover_url} alt={p.title} fill className="object-cover" sizes="52px" />
                    ) : (
                      <span>🧶</span>
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "13px",
                        color: "var(--prune)",
                        lineHeight: 1.4,
                        marginBottom: "3px",
                      }}
                    >
                      {p.title}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {formatDate(p.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "22px 20px",
                border: "1px solid var(--creme-dark)",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "10px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--sable)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span style={{ width: "14px", height: "1px", background: "var(--sable)", display: "inline-block" }} />
                Tags
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "9px",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      background: "#fff",
                      color: "var(--prune)",
                      padding: "7px 16px",
                      borderRadius: "30px",
                      border: "1px solid var(--lavande-light)",
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter sidebar */}
          <div
            style={{
              background: "var(--prune)",
              borderRadius: "16px",
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "19px",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              La newsletter
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,.65)",
                lineHeight: 1.5,
                marginBottom: "16px",
              }}
            >
              Recevez mes articles et exclusivités chaque mois ✉️
            </p>
            <NewsletterSection theme={theme} />
          </div>
        </aside>
      </div>

      {/* Articles liés */}
      {relatedPosts.length > 0 && (
        <section className="section section--creme">
          <div className="section__header">
            <span className="section__eyebrow">Dans la même veine</span>
            <h2 className="section__title">Vous aimerez aussi…</h2>
            <div className="section__line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {relatedPosts.map((p) => (
              <ArticleCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
