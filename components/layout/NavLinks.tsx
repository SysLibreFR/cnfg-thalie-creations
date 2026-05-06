"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkItem {
  label: string;
  url: string;
}

export default function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <ul style={{ display: "flex", gap: "28px" }}>
      {links.map((link) => {
        const isActive =
          link.url === "/"
            ? pathname === "/"
            : pathname.startsWith(link.url);
        return (
          <li key={link.url}>
            <Link
              href={link.url}
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "10px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: isActive ? "var(--prune)" : "var(--text-muted)",
                transition: "color .2s",
              }}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
