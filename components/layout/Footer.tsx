import Link from "next/link";
import type { Artisan, Menu } from "@/lib/types";

const DEFAULT_FOOTER_LINKS = [
  { label: "Mentions légales", url: "/mentions-legales" },
  { label: "CGV", url: "/cgv" },
];

export default function Footer({
  artisan,
  menu,
}: {
  artisan: Artisan | null;
  menu: Menu | null;
}) {
  const contact = artisan?.contact ?? {};
  const theme = artisan?.theme_config ?? {};
  const tagline =
    artisan?.description
      ? artisan.description.split(".")[0] + "."
      : "Créations au crochet faites avec amour";

  const links = menu?.items?.length
    ? menu.items.map((i) => ({ label: i.label, url: i.url }))
    : DEFAULT_FOOTER_LINKS;

  return (
    <footer className="footer">
      <div>
        <p className="footer__logo">{artisan?.name ?? "Thalie Créations"}</p>
        <p className="footer__tagline">{tagline}</p>
      </div>

      <ul className="footer__links">
        {contact.instagram && (
          <li>
            <a
              href={contact.instagram as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
        )}
        {(contact.etsy ?? theme.etsy_url) && (
          <li>
            <a
              href={(contact.etsy ?? theme.etsy_url) as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etsy
            </a>
          </li>
        )}
        {contact.email && (
          <li>
            <a href={`mailto:${contact.email as string}`}>Contact</a>
          </li>
        )}
        {links.map((link) => (
          <li key={link.url}>
            <Link href={link.url}>{link.label}</Link>
          </li>
        ))}
      </ul>

      <span className="footer__hearts">♥ ♥ ♥</span>
    </footer>
  );
}
