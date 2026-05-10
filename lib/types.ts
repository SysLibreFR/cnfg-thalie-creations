// ── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

// ── Editorial blocks ─────────────────────────────────────────────────────────
// Retournés par GET /api/v1/artisans/{slug}/editorial-blocks/
// Chaque bloc a un slug unique, un schéma de champs (fields) et les valeurs (data).

export interface EditorialBlockField {
  name: string;
  label: string;
  field_type: string;
  options?: { value: string; label: string }[];
}

export interface EditorialBlock {
  id: string;
  slug: string;
  fields: EditorialBlockField[];
  data: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

// Types utilitaires pour les valeurs de blocs fréquemment utilisées

export interface BlockValueItem {
  icon: string;
  title: string;
  text: string;
}

export interface BlockTimelineItem {
  year: string;
  title: string;
  text: string;
}

export interface BlockStatItem {
  number: string;
  label: string;
}

export interface BlockAtelierCell {
  icon: string;
}

export interface BlockCreationItem {
  icon: string;
  label: string;
}

// ── Theme config (design system uniquement) ──────────────────────────────────
// Le contenu éditorial (textes de sections, listes) est dans les editorial blocks.
// theme_config contient seulement : couleurs, polices, méta-infos artisan.

export interface ThemeConfig {
  primary_color?: string;
  font_heading?: string;
  font_subtitle?: string;
  font_body?: string;
  font_label?: string;
  layout?: "default" | "sidebar" | "fullwidth";
  artisan_role?: string;  // ex: "Créatrice & artisane"
  etsy_url?: string;      // URL boutique Etsy
  [key: string]: unknown;
}

export interface ArtisanContact {
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  etsy?: string;
  [key: string]: unknown;
}

export interface Artisan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_featured: boolean;
  theme_config: ThemeConfig;
  contact: ArtisanContact;
  created_at: string;
  updated_at: string;
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  artisan_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  media_file_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
}

export interface Product {
  id: string;
  artisan_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string | null;
  compare_at_price: string | null;
  price_on_request: boolean;
  status: string;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  dimensions: Record<string, unknown>;
  tags: string[];
  custom_fields: Record<string, unknown>;
  meta_title: string;
  meta_description: string;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ── Custom field schema ───────────────────────────────────────────────────────

export interface FieldSchemaDef {
  id: string;
  artisan_id: string;
  name: string;
  label: string;
  field_type: "text" | "textarea" | "number" | "decimal" | "boolean" | "select" | "multiselect" | "date" | "image" | "file";
  options: { value: string; label: string }[];
  is_required: boolean;
  help_text: string | null;
  display_order: number;
  conditional_on_field_id: string | null;
  conditional_on_value: string | null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  artisan_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_url: string | null;
  meta_title: string;
  meta_description: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  artisan_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  tags: string[];
  meta_title: string;
  meta_description: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ── Testimonial ───────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  artisan_id: string;
  author_name: string;
  author_role: string;
  content: string;
  rating: number | null;
  avatar_url: string | null;
  is_featured: boolean;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── Menu ──────────────────────────────────────────────────────────────────────

export interface MenuItem {
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItem[];
}

export interface Menu {
  id: string;
  artisan_id: string;
  name: string;
  slug: string;
  items: MenuItem[];
  status: string;
  created_at: string;
  updated_at: string;
}
