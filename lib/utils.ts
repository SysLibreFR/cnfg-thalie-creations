export function formatPrice(price: string | null): string {
  if (price === null) return "";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    parseFloat(price)
  );
}

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
