import type {
  Artisan,
  BlogPost,
  Category,
  EditorialBlock,
  FieldSchemaDef,
  Menu,
  Page,
  PaginatedResponse,
  Product,
  Testimonial,
} from "./types";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const SLUG = process.env.ARTISAN_SLUG ?? "";

if (typeof window === "undefined") {
  if (!API_URL) console.warn("[api] API_URL n'est pas défini");
  if (!SLUG)    console.warn("[api] ARTISAN_SLUG n'est pas défini");
}

// ── Core fetch ───────────────────────────────────────────────────────────────

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  // Guard: env vars absent during build — return null instead of crashing
  if (!API_URL || !SLUG) return null as T;

  const url = new URL(`${API_URL}${path}`);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const nextConfig: { revalidate?: number; tags?: string[] } = {};
  if (opts.revalidate === false) {
    nextConfig.revalidate = 0;
  } else if (opts.revalidate !== undefined) {
    nextConfig.revalidate = opts.revalidate;
  }
  if (opts.tags?.length) nextConfig.tags = opts.tags;

  try {
    const res = await fetch(url.toString(), { next: nextConfig });
    if (!res.ok) {
      if (res.status === 404) return null as T;
      throw new Error(`API ${res.status}: ${url.pathname}`);
    }
    return res.json();
  } catch (err) {
    console.error(`[api] fetch failed for ${path}:`, err);
    return null as T;
  }
}

// ── Artisan ──────────────────────────────────────────────────────────────────

export function getArtisan(): Promise<Artisan | null> {
  return apiFetch(`/api/v1/artisans/${SLUG}/`, { revalidate: 3600, tags: ["artisan"] });
}

// ── Editorial blocks ──────────────────────────────────────────────────────────

export async function getEditorialBlocks(): Promise<EditorialBlock[]> {
  const result = await apiFetch<EditorialBlock[] | null>(
    `/api/v1/artisans/${SLUG}/editorial-blocks/`,
    { revalidate: 600, tags: ["editorial"] }
  );
  return result ?? [];
}

// ── Field schema ─────────────────────────────────────────────────────────────

export async function getFieldSchema(): Promise<FieldSchemaDef[]> {
  const result = await apiFetch<FieldSchemaDef[] | null>(
    `/api/v1/artisans/${SLUG}/field-schema/`,
    { revalidate: 3600, tags: ["artisan"] }
  );
  return result ?? [];
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_slug?: string;
  is_featured?: boolean;
  search?: string;
}

export function getProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
  return apiFetch(`/api/v1/artisans/${SLUG}/products/`, {
    revalidate: 600,
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export function getProduct(slug: string): Promise<Product | null> {
  return apiFetch(`/api/v1/artisans/${SLUG}/products/${slug}/`, {
    revalidate: 300,
    tags: ["product"],
  });
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const result = await apiFetch<Category[] | null>(
    `/api/v1/artisans/${SLUG}/categories/`,
    { revalidate: 3600 }
  );
  return result ?? [];
}

// ── Pages ────────────────────────────────────────────────────────────────────

export function getPage(slug: string): Promise<Page | null> {
  return apiFetch(`/api/v1/artisans/${SLUG}/pages/${slug}/`, { revalidate: 3600 });
}

// ── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogListParams {
  page?: number;
  page_size?: number;
  tag?: string;
  search?: string;
}

export function getBlogPosts(params?: BlogListParams): Promise<PaginatedResponse<BlogPost>> {
  return apiFetch(`/api/v1/artisans/${SLUG}/blog/`, {
    revalidate: 600,
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export function getBlogPost(slug: string): Promise<BlogPost | null> {
  return apiFetch(`/api/v1/artisans/${SLUG}/blog/${slug}/`, { revalidate: 600 });
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export function getTestimonials(params?: {
  page?: number;
  page_size?: number;
  featured_only?: boolean;
}): Promise<PaginatedResponse<Testimonial>> {
  return apiFetch(`/api/v1/artisans/${SLUG}/testimonials/`, {
    revalidate: 3600,
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

// ── Menus ────────────────────────────────────────────────────────────────────

export function getMenu(slug: string): Promise<Menu | null> {
  return apiFetch(`/api/v1/artisans/${SLUG}/menus/${slug}/`, {
    revalidate: 3600,
    tags: ["artisan"],
  });
}
