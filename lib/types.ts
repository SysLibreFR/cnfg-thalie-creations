// ── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

// ── Theme config extensions for Thalie Créations ────────────────────────────
// Ces champs sont configurés dans l'admin CFNG via theme_config (JSONB libre)

export interface ValueItem {
  icon: string;     // emoji ou URL d'icône
  title: string;
  text: string;
}

export interface StatItem {
  number: string;   // ex: "+500", "4,9★"
  label: string;
}

export interface TimelineItem {
  year: string;     // ex: "Enfance", "2021", "Aujourd'hui"
  title: string;
  text: string;
  side?: "left" | "right"; // position dans la timeline, sinon alterné
}

export interface AtelierCell {
  icon: string;
}

export interface ThemeConfig {
  // Couleurs / polices (standard CFNG)
  primary_color?: string;
  font_heading?: string;
  font_subtitle?: string;
  font_body?: string;
  font_label?: string;
  layout?: "default" | "sidebar" | "fullwidth";

  // Hero accueil
  hero_eyebrow?: string;    // ex: "Artisanat fait main"
  hero_title?: string;      // ex: "Chaque maille, une histoire d'amour"
  hero_subtitle?: string;   // texte sous le titre
  hero_caption?: string;    // sous le monogramme, ex: "Créations au crochet"

  // Bandeau défilant
  banner_items?: string[];  // ex: ["Livraison soignée", "Fait main", ...]

  // Section produits vedettes (accueil)
  featured_eyebrow?: string;
  featured_title?: string;

  // Valeurs / engagements
  values_eyebrow?: string;
  values_title?: string;
  values?: ValueItem[];

  // Témoignages
  testimonials_eyebrow?: string;
  testimonials_title?: string;

  // Newsletter
  newsletter_title?: string;
  newsletter_subtitle?: string;

  // À propos
  artisan_role?: string;       // ex: "Créatrice & artisane"
  about_eyebrow?: string;
  timeline?: TimelineItem[];
  atelier_title?: string;
  atelier_text1?: string;
  atelier_text2?: string;
  atelier_tags?: string[];
  atelier_cells?: AtelierCell[];
  stats?: StatItem[];
  stats_eyebrow?: string;
  stats_title?: string;

  // URLs sociales / externes (complément du champ contact)
  etsy_url?: string;

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
