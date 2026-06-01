"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Artisan, Menu } from "@/lib/types";
import CartBadge from "./CartBadge";

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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
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
        className="nav-root"
      >
        {/* Logo */}
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

        {/* Liens desktop */}
        <ul className="nav-links-desktop" style={{ display: "flex", gap: "28px", alignItems: "center" }}>
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

        {/* Panier + CTA desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="nav-cart-header">
            <CartBadge />
          </span>
          <Link
            href="/boutique"
            className="btn btn--primary nav-cta-desktop"
            style={{ padding: "10px 20px", fontSize: "10px" }}
          >
            Voir la boutique
          </Link>
        </div>

        {/* Bouton hamburger mobile */}
        <div className="nav-hamburger-group" style={{ display: "none", alignItems: "center", gap: "4px" }}>
          <CartBadge />
          <button
            className="nav-hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "var(--prune)",
                borderRadius: "2px",
                transition: "transform .2s, opacity .2s",
                transform: open ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "var(--prune)",
                borderRadius: "2px",
                transition: "opacity .2s",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "var(--prune)",
                borderRadius: "2px",
                transition: "transform .2s, opacity .2s",
                transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Menu mobile déroulant */}
      {open && (
        <div
          className="nav-mobile-menu"
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            background: "#fff",
            borderBottom: "1px solid var(--creme-dark)",
            zIndex: 99,
            padding: "16px 20px 24px",
            boxShadow: "0 8px 24px rgba(107,42,90,.08)",
          }}
        >
          <ul style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {links.map((link) => {
              const isActive =
                link.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.url);
              return (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "11px",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: isActive ? "var(--prune)" : "var(--text-muted)",
                      padding: "14px 0",
                      borderBottom: "1px solid var(--creme-dark)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <CartBadge />
            <Link
              href="/boutique"
              onClick={() => setOpen(false)}
              className="btn btn--primary"
              style={{ flex: 1, textAlign: "center", fontSize: "10px" }}
            >
              Voir la boutique
            </Link>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            top: "64px",
            zIndex: 98,
            background: "rgba(0,0,0,0.2)",
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-root { padding: 0 16px !important; }
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop   { display: none !important; }
          .nav-cart-header   { display: none !important; }
          .nav-hamburger-group { display: flex !important; }
          .nav-mobile-menu   { display: block; }
        }
      `}</style>
    </>
  );
}
