import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/types";
import { formatDateShort } from "@/lib/utils";

export default function FeaturedArticle({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="featured-article-grid">
      {/* Image */}
      <div
        style={{
          background: "var(--lavande-pale)",
          height: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="60vw"
          />
        ) : (
          <span style={{ fontSize: "80px" }}>🧶</span>
        )}
        <span
          className="badge badge--une"
          style={{ position: "absolute", top: "16px", left: "16px" }}
        >
          À la une
        </span>
      </div>

      {/* Contenu */}
      <div
        style={{
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="article-meta">
          {post.tags[0] && <span className="article-meta__cat">{post.tags[0]}</span>}
          <span className="article-meta__date">
            {formatDateShort(post.published_at)}
          </span>
        </div>
        <h2
          style={{
            fontSize: "24px",
            color: "var(--prune)",
            lineHeight: 1.3,
            marginBottom: "12px",
          }}
        >
          {post.title}
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            lineHeight: 1.75,
            marginBottom: "22px",
          }}
        >
          {post.excerpt}
        </p>
        <span
          className="btn btn--primary"
          style={{ width: "fit-content" }}
        >
          Lire l’article →
        </span>
      </div>
    </Link>
  );
}
