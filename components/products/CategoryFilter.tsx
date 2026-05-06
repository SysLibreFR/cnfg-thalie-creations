import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const pillStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "9px",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    padding: "8px 18px",
    borderRadius: "30px",
    border: "1px solid var(--lavande-light)",
    background: active ? "var(--prune)" : "#fff",
    color: active ? "#fff" : "var(--text-muted)",
    cursor: "pointer",
    transition: "all .2s",
    display: "inline-block",
  });

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
      <Link href="/boutique" style={pillStyle(!activeSlug)}>
        Toutes
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/boutique?categorie=${cat.slug}`}
          style={pillStyle(activeSlug === cat.slug)}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
