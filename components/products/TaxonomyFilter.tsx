import Image from "next/image";
import Link from "next/link";
import type { ProductTaxonomyType } from "@/lib/types";

export default function TaxonomyFilter({
  taxonomy,
  activeTermSlugs,
}: {
  taxonomy: ProductTaxonomyType;
  activeTermSlugs?: string;
}) {
  const selected = activeTermSlugs ? activeTermSlugs.split(",") : [];
  const allSelected = !activeTermSlugs;

  const buildHref = (slug?: string) => {
    if (!slug) return "/boutique";
    return `/boutique?terme=${slug}`;
  };

  const isOccasions = taxonomy.slug === "occasions-saisons";

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

  if (isOccasions) {
    return (
      <div className="taxonomy-filter" style={{ marginBottom: "24px" }}>
        <span
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginRight: "12px",
          }}
        >
          {taxonomy.name} :
        </span>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link
            href="/boutique"
            style={{
              ...pillStyle(allSelected),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              padding: 0,
              fontSize: "10px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Toutes
          </Link>
          {taxonomy.terms.map((term) => {
            const active = selected.includes(term.slug);
            return (
              <Link
                key={term.id}
                href={buildHref(term.slug)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: active
                      ? "2px solid var(--prune)"
                      : "1px solid var(--lavande-light)",
                    background: "#fff",
                    transition: "all .2s",
                  }}
                >
                  {term.image_url ? (
                    <Image
                      src={term.image_url}
                      alt={term.name}
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <span style={{ fontSize: "28px" }}>{term.emoji ?? "📦"}</span>
                  )}
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "13px",
                    color: active ? "var(--prune)" : "var(--text-muted)",
                    fontWeight: active ? 600 : 400,
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: "80px",
                  }}
                >
                  {term.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="taxonomy-filter" style={{ marginBottom: "24px" }}>
      <span
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "9px",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginRight: "12px",
        }}
      >
        {taxonomy.name} :
      </span>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Link href="/boutique" style={pillStyle(allSelected)}>
          Tous
        </Link>
        {taxonomy.terms.map((term) => (
          <Link
            key={term.id}
            href={buildHref(term.slug)}
            style={pillStyle(selected.includes(term.slug))}
          >
            {term.emoji && `${term.emoji} `}
            {term.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
