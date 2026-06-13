import Link from "next/link";
import type { ProductTaxonomyType } from "@/lib/types";

export default function TaxonomySidebar({
  taxonomy,
  activeTermSlug,
}: {
  taxonomy: ProductTaxonomyType;
  activeTermSlug?: string;
}) {
  if (!taxonomy.terms.length) return null;

  return (
    <nav className="taxonomy-sidebar">
      <h3 className="taxonomy-sidebar__title">{taxonomy.name}</h3>
      <ul className="taxonomy-sidebar__list">
        <li>
          <Link
            href="/boutique"
            className={`taxonomy-sidebar__item${!activeTermSlug ? " active" : ""}`}
          >
            Toutes les catégories
          </Link>
        </li>
        {taxonomy.terms.map((term) => (
          <li key={term.id}>
            <Link
              href={`/boutique?terme=${term.slug}`}
              className={`taxonomy-sidebar__item${activeTermSlug === term.slug ? " active" : ""}`}
            >
              {term.emoji && <span className="taxonomy-sidebar__emoji">{term.emoji}</span>}
              {term.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
