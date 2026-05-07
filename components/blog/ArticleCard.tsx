import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/types";
import { formatDateShort, readTime } from "@/lib/utils";

export default function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="article-card">
      <div className="article-card__img" style={{ background: "var(--lavande-pale)" }}>
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span style={{ fontSize: "46px" }}>🧶</span>
        )}
      </div>
      <div className="article-card__body">
        <div className="article-meta">
          {post.tags[0] && (
            <span className="article-meta__cat">{post.tags[0]}</span>
          )}
          <span className="article-meta__date">
            {formatDateShort(post.published_at)}
          </span>
        </div>
        <p className="article-card__title">{post.title}</p>
        <p className="article-card__excerpt">{post.excerpt}</p>
        <div className="article-card__footer">
          <span className="read-time">⏱ {readTime(post.content)} min</span>
          <span className="read-link">Lire →</span>
        </div>
      </div>
    </Link>
  );
}
