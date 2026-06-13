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

// ── Product Taxonomy (classements) ────────────────────────────────────────────

export interface ProductTaxonomyTerm {
  id: string;
  product_taxonomy_type_id: string;
  product_taxonomy_type_slug: string;
  name: string;
  slug: string;
  emoji: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductTaxonomyType {
  id: string;
  artisan_id: string;
  name: string;
  slug: string;
  description: string | null;
  selection_type: "single" | "multiple";
  sort_order: number;
  created_at: string;
  updated_at: string;
  terms: ProductTaxonomyTerm[];
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
  taxonomy_terms: ProductTaxonomyTerm[];
  dimensions: Record<string, unknown>;
  tags: string[];
  custom_fields: Record<string, unknown>;
  meta_title: string;
  meta_description: string;
  images: ProductImage[];
  stock_quantity: number | null;
  track_inventory: boolean;
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
  customer_facing?: boolean;
  customer_facing_label?: string | null;
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

// ── Shipping / Carriers ────────────────────────────────────────────────

export interface ShippingCarrier {
  carrier: string;
  enabled: boolean;
  public_config: Record<string, unknown>;
}

export interface ShippingConfig {
  carriers: ShippingCarrier[];
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
}

// ── Checkout / Panier ──────────────────────────────────────────────────

export interface CheckoutItem {
  product_id: string;
  quantity: number;
  custom_fields?: Record<string, string>;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  price: string;
  free_above: string | null;
}

export interface ValidateResponse {
  items: Array<{
    product_id: string;
    valid: boolean;
    errors?: string[];
  }>;
  subtotal: number;
  shipping_cost: number;
  estimated_tax: number;
  total: number;
  shipping_zones_available: ShippingZone[];
}

export interface CreateSessionResponse {
  session_url: string;
  order_id: string;
  token: string;
}

export interface OrderPublic {
  status: string;
  total: string;
  currency: string;
  paid_at: string | null;
  created_at: string;
  items: Array<{
    product_snapshot: { name: string; slug: string; image_url?: string };
    quantity: number;
    unit_price: string;
    subtotal: string;
    customizations: Record<string, { label: string; value: unknown; label_value?: string }> | null;
  }>;
  status_history: Array<{
    from_status: string | null;
    to_status: string;
    created_at: string;
  }>;
}
