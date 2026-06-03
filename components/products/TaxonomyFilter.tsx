import Link from "next/link";
import type { ProductTaxonomyType } from "@/lib/types";

export default function TaxonomyFilter({
  taxonomy,
  activeTermIds,
}: {
  taxonomy: ProductTaxonomyType;
  activeTermIds?: string;
}) {
  const selected = activeTermIds ? activeTermIds.split(",") : [];
  const allSelected = !activeTermIds;

  const buildHref = (termId?: string) => {
    if (!termId) return "/boutique";
    return `/boutique?term_ids=${termId}`;
  };

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
            href={buildHref(term.id)}
            style={pillStyle(selected.includes(term.id))}
          >
            {term.emoji && `${term.emoji} `}
            {term.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
