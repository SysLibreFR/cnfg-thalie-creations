import type { EditorialBlock } from "./types";

// ── Price ────────────────────────────────────────────────────────────────────────

export function formatPrice(price: string | null): string {
  if (price === null) return "";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    parseFloat(price)
  );
}

// ── Date ────────────────────────────────────────────────────────────────────────

export function formatDate(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// ── Editorial blocks helpers ────────────────────────────────────────────────

/**
 * Retourne les `data` d'un bloc par son slug, ou un objet vide si absent.
 * Usage : const d = blockData(blocks, 'hero')  =>  d.title, d.items
 */
export function blockData(
  blocks: EditorialBlock[] | null | undefined,
  slug: string
): Record<string, unknown> {
  return blocks?.find((b) => b.slug === slug)?.data ?? {};
}

/**
 * Indique si un bloc est présent et actif dans la liste.
 */
export function hasBlock(
  blocks: EditorialBlock[] | null | undefined,
  slug: string
): boolean {
  return !!blocks?.find((b) => b.slug === slug && b.is_active);
}

// ── Misc ───────────────────────────────────────────────────────────────────────

export function coverImage(
  images: { url: string; is_cover: boolean }[]
): string | null {
  return images.find((i) => i.is_cover)?.url ?? images[0]?.url ?? null;
}

export function readTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
