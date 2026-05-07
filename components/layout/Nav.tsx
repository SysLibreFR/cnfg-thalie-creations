import Link from "next/link";
import type { Artisan, Menu } from "@/lib/types";
import NavLinks from "./NavLinks";

const DEFAULT_LINKS = [
  { label: "Boutique", url: "/boutique" },
  { label: "À propos", url: "/a-propos" },
  { label: "Blog", url: "/blog" },
];

export default function Nav({
  artisan,
  menu,
}: {
  artisan: Artisan | null;
  menu: Menu | null;
}) {
  const links =
    menu?.items?.map((i) => ({ label: i.label, url: i.url })) ?? DEFAULT_LINKS;

  return (
    <nav
      style={{
        background: "#fff",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        borderBottom: "1px solid var(--lavande-light)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "20px",
          color: "var(--prune)",
        }}
      >
        {artisan?.name ?? "Thalie Créations"}
      </Link>

      <NavLinks links={links} />

      <Link
        href="/boutique"
        className="btn btn--primary"
        style={{ padding: "10px 20px", fontSize: "10px" }}
      >
        Voir la boutique
      </Link>
    </nav>
  );
}
