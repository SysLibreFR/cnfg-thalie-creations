# Guide d'intégration frontend — Site artisan

Ce document est destiné au développeur du site vitrine de l'artisan (projet externe, déployé indépendamment). Il couvre tous les endpoints publics disponibles, les formes de réponse exactes, les conventions de pagination, et les recommandations d'architecture.

L'URL de base de l'API est configurée via la variable d'environnement `NEXT_PUBLIC_API_URL` (ou équivalent selon le framework choisi).

---

## Sommaire

1. [Configuration & CORS](#1-configuration--cors)
2. [Pagination](#2-pagination)
3. [Profil artisan](#3-profil-artisan)
4. [Produits](#4-produits)
5. [Classements](#5-classements)
6. [Catégories](#6-catégories)
7. [Champs personnalisés](#7-champs-personnalisés)
8. [Pages, Blog, Galeries, Témoignages, Menus](#8-pages-blog-galeries-témoignages-menus)
9. [Blocs éditoriaux](#9-blocs-éditoriaux)
10. [Formulaires](#10-formulaires)
11. [Checkout — Panier & Commande](#11-checkout--panier--commande)
12. [Suivi de commande](#12-suivi-de-commande)
13. [Site chapeau (catalogue global)](#13-site-chapeau-catalogue-global)
14. [Médias — URLs](#14-médias--urls)
15. [Recommandations d'architecture](#15-recommandations-darchitecture)

---

## 1. Configuration & CORS

L'API autorise les origins listées dans `CORS_ORIGINS` côté backend. Avant de déployer le frontend artisan, ajouter son domaine dans la variable d'environnement du backend :

```
CORS_ORIGINS=https://monartisan.fr,https://www.monartisan.fr,https://admin.cfng.fr
```

Toutes les routes listées dans ce document sont **publiques** (aucun token requis).

---

## 2. Pagination

Les endpoints qui retournent des listes paginées acceptent les paramètres query :

| Paramètre | Défaut | Description |
|---|---|---|
| `page` | `1` | Numéro de page (1-indexed) |
| `page_size` | `20` | Taille de page (max 100) |

La réponse a toujours cette forme :

```json
{
  "total": 42,
  "page": 1,
  "page_size": 20,
  "items": [ /* … */ ]
}
```

---

## 3. Profil artisan

### `GET /api/v1/artisans/{slug}/`

Retourne le profil public de l'artisan et sa configuration de thème.

```json
{
  "id": "uuid",
  "slug": "marie-ceramique",
  "name": "Marie Céramique",
  "description": "Atelier de céramique raku…",
  "logo_url": "https://api.cfng.fr/media/logo.jpg",
  "cover_url": "https://api.cfng.fr/media/cover.jpg",
  "is_featured": true,
  "theme_config": {
    "primary_color": "#c47c3e",
    "font_heading": "Playfair Display",
    "font_body": "Inter",
    "layout": "sidebar"
  },
  "contact": {
    "email": "contact@marie-ceramique.fr",
    "phone": "+33 6 12 34 56 78",
    "address": "12 rue du Four, 75011 Paris",
    "instagram": "https://instagram.com/marie.ceramique",
    "facebook": null
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-06-01T14:30:00Z"
}
```

`theme_config` et `contact` sont des objets JSONB libres — leur structure exacte est définie par l'artisan dans l'administration. Le frontend doit être défensif (accès avec `?.`).

**Erreurs :**
- `404` — artisan introuvable ou inactif

---

## 4. Produits

### `GET /api/v1/artisans/{slug}/products/`

Liste les produits publiés de l'artisan. Paginée.

**Paramètres query optionnels :**

| Paramètre | Type | Description |
|---|---|---|
| `page` | int | Page (défaut 1) |
| `page_size` | int | Taille (défaut 20, max 100) |
| `category_slug` | string | Filtrer par catégorie |
| `is_featured` | bool | Filtrer les produits mis en avant |
| `search` | string | Recherche textuelle sur le nom |

**Réponse (items) :**

```json
{
  "id": "uuid",
  "artisan_id": "uuid",
  "name": "Bol raku noir",
  "slug": "bol-raku-noir",
  "description": "Bol en grès raku, cuisson four…",
  "short_description": "Bol artisanal unique",
  "price": "45.00",
  "compare_at_price": null,
  "price_on_request": false,
  "status": "published",
  "is_featured": false,
  "sort_order": 0,
  "category_id": "uuid-ou-null",
  "dimensions": { "height_cm": 8, "diameter_cm": 15 },
  "tags": ["céramique", "raku", "fait-main"],
  "custom_fields": {
    "wood_type": "chêne",
    "finish": "naturel"
  },
  "meta_title": "",
  "meta_description": "",
  "images": [
    {
      "id": "uuid",
      "media_file_id": "uuid",
      "url": "https://api.cfng.fr/media/bol-raku-1.jpg",
      "alt_text": "Bol raku de face",
      "sort_order": 0,
      "is_cover": true
    }
  ],
  "created_at": "2024-03-01T09:00:00Z",
  "updated_at": "2024-05-15T11:00:00Z",
  "published_at": "2024-03-02T08:00:00Z"
}
```

Notes :
- `price` est un string décimal (`"45.00"`) — afficher avec `parseFloat()` ou une lib de formatage monétaire
- `price_on_request: true` → ne pas afficher le champ `price`, afficher "Prix sur demande"
- `compare_at_price` est le prix barré (avant promotion) quand non null
- `images[0]` avec `is_cover: true` est la photo principale
- `custom_fields` dépend du schéma de l'artisan (voir section 6)

### `GET /api/v1/artisans/{slug}/products/{product_id}/`

Détail d'un produit. Même forme que ci-dessus.

**Erreurs :**
- `404` — produit introuvable, non publié, ou n'appartient pas à cet artisan

---

## 5. Classements

### `GET /api/v1/artisans/{slug}/product-taxonomies/`

Liste les types de classements de l'artisan (ex: "Matières", "Couleurs") avec leurs termes. Utilisé pour les filtres du catalogue.

```json
[
  {
    "id": "uuid",
    "name": "Matières",
    "slug": "matieres",
    "selection_type": "single",
    "sort_order": 0,
    "terms": [
      { "id": "uuid", "name": "Bois", "slug": "bois", "sort_order": 0 },
      { "id": "uuid", "name": "Céramique", "slug": "ceramique", "sort_order": 1 }
    ]
  }
]
```

`selection_type` : `"single"` (un seul terme possible par produit) ou `"multiple"`.

---

## 6. Catégories

### `GET /api/v1/artisans/{slug}/categories/`

Liste toutes les catégories de l'artisan, triées par `sort_order` puis `name`.

```json
[
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "parent_id": null,
    "name": "Bols",
    "slug": "bols",
    "description": "Tous les bols",
    "sort_order": 0
  },
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "parent_id": "uuid-parent",
    "name": "Bols raku",
    "slug": "bols-raku",
    "description": null,
    "sort_order": 1
  }
]
```

`parent_id` non null indique une sous-catégorie. Pour construire l'arborescence côté frontend :

```ts
function buildTree(categories) {
  const map = Object.fromEntries(categories.map(c => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const c of Object.values(map)) {
    if (c.parent_id) map[c.parent_id]?.children.push(c);
    else roots.push(c);
  }
  return roots;
}
```

---

## 7. Champs personnalisés

### `GET /api/v1/artisans/{slug}/field-schema/`

Retourne les définitions des champs personnalisés de l'artisan, dans l'ordre d'affichage.

```json
[
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "name": "wood_type",
    "label": "Essence de bois",
    "field_type": "select",
    "options": [
      { "value": "chene", "label": "Chêne" },
      { "value": "noyer", "label": "Noyer" }
    ],
    "is_required": false,
    "help_text": "Choisir l'essence utilisée",
    "display_order": 0,
    "conditional_on_field_id": null,
    "conditional_on_value": null
  },
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "name": "finish_detail",
    "label": "Détail de finition",
    "field_type": "text",
    "options": [],
    "is_required": false,
    "help_text": null,
    "display_order": 1,
    "conditional_on_field_id": "uuid-du-champ-wood_type",
    "conditional_on_value": "noyer"
  }
]
```

Types possibles pour `field_type` : `text`, `textarea`, `number`, `decimal`, `boolean`, `select`, `multiselect`, `date`, `image`, `file`.

Pour un champ avec `conditional_on_field_id` non null : l'afficher uniquement si la valeur du champ référencé dans `custom_fields` du produit correspond à `conditional_on_value`.

```ts
function isFieldVisible(field, fieldDefs, customFields) {
  if (!field.conditional_on_field_id) return true;
  const dep = fieldDefs.find(f => f.id === field.conditional_on_field_id);
  if (!dep) return true;
  return String(customFields[dep.name] ?? "") === field.conditional_on_value;
}
```

Pour les types `image` et `file`, la valeur dans `custom_fields` est une URL directe (déjà résolue au moment de la réponse).

---

## 8. Pages, Blog, Galeries, Témoignages, Menus

Tous les endpoints publics suivants sont disponibles. Ils retournent uniquement le contenu au statut `published`.

### Pages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/artisans/{slug}/pages/` | Liste des pages publiées |
| `GET` | `/api/v1/artisans/{slug}/pages/{page_slug}/` | Détail d'une page |

### Blog

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/artisans/{slug}/blog/` | Liste des articles (paginé, filtrable par `tag` et `search`) |
| `GET` | `/api/v1/artisans/{slug}/blog/{post_slug}/` | Détail d'un article |

### Galeries

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/artisans/{slug}/galleries/` | Liste des galeries |
| `GET` | `/api/v1/artisans/{slug}/galleries/{gallery_slug}/` | Détail d'une galerie avec ses items |

### Témoignages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/artisans/{slug}/testimonials/` | Liste des témoignages (filtrable par `featured_only`) |

### Menus

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/artisans/{slug}/menus/` | Liste des menus |
| `GET` | `/api/v1/artisans/{slug}/menus/{menu_slug}/` | Détail d'un menu |

**Formes de réponse :**

**Page**
```json
{
  "id": "uuid", "artisan_id": "uuid",
  "title": "À propos", "slug": "a-propos",
  "content": "<p>HTML ou Markdown…</p>",
  "excerpt": "Court résumé",
  "cover_url": null,
  "meta_title": "", "meta_description": "",
  "status": "published", "sort_order": 0,
  "created_at": "…", "updated_at": "…", "published_at": "…"
}
```

**Article de blog**
```json
{
  "id": "uuid", "artisan_id": "uuid",
  "title": "Mon premier bol raku", "slug": "premier-bol-raku",
  "excerpt": "Court résumé",
  "content": "<p>Corps de l'article…</p>",
  "cover_url": "https://api.cfng.fr/media/cover.jpg",
  "tags": ["raku", "technique"],
  "meta_title": "", "meta_description": "",
  "status": "published", "sort_order": 0,
  "created_at": "…", "updated_at": "…", "published_at": "…"
}
```

**Galerie**
```json
{
  "id": "uuid", "artisan_id": "uuid",
  "name": "Collection printemps", "slug": "collection-printemps",
  "description": "…", "cover_url": null,
  "status": "published", "sort_order": 0,
  "items": [
    {
      "id": "uuid", "media_file_id": "uuid",
      "url": "https://api.cfng.fr/media/photo1.jpg",
      "caption": "Bol raku", "display_order": 0
    }
  ],
  "created_at": "…", "updated_at": "…"
}
```

**Témoignage**
```json
{
  "id": "uuid", "artisan_id": "uuid",
  "author_name": "Sophie M.", "author_role": "Cliente fidèle",
  "content": "Magnifique bol, je recommande !",
  "rating": 5,
  "avatar_url": null,
  "is_featured": true,
  "status": "published", "sort_order": 0,
  "created_at": "…", "updated_at": "…"
}
```

**Menu**
```json
{
  "id": "uuid", "artisan_id": "uuid",
  "name": "Navigation principale", "slug": "principal",
  "items": [
    { "label": "Accueil", "url": "/", "target": "_self", "children": [] },
    {
      "label": "Boutique", "url": "/boutique", "target": "_self",
      "children": [
        { "label": "Bols", "url": "/boutique/bols", "target": "_self", "children": [] }
      ]
    }
  ],
  "status": "published",
  "created_at": "…", "updated_at": "…"
}
```

---

## 9. Blocs éditoriaux

### `GET /api/v1/artisans/{slug}/editorial-blocks/`

Liste les blocs éditoriaux actifs de l'artisan (bannières, encarts promotionnels, etc.).

```json
[
  {
    "id": "uuid",
    "name": "Bannière promotionnelle",
    "slug": "banniere-promo",
    "fields": [
      { "key": "title", "type": "text", "label": "Titre" },
      { "key": "image", "type": "image", "label": "Image de fond" }
    ],
    "data": {
      "title": "Livraison offerte en juin",
      "image": "https://api.cfng.fr/media/banniere.jpg"
    },
    "is_active": true,
    "sort_order": 0
  }
]
```

Chaque bloc a une structure de `fields` définie par son template. Les `data` contiennent les valeurs renseignées par l'artisan. Le frontend doit construire le rendu dynamiquement en fonction des types de champs.

---

## 10. Formulaires

### `GET /api/v1/artisans/{slug}/forms/`

Liste les formulaires publiés de l'artisan.

### `GET /api/v1/artisans/{slug}/forms/{form_slug}/`

Détail d'un formulaire avec ses champs (structure) :

```json
{
  "id": "uuid",
  "name": "Contact",
  "slug": "contact",
  "description": "Formulaire de contact",
  "notification_email": "contact@artisan.fr",
  "success_message": "Merci pour votre message !",
  "fields": [
    {
      "id": "uuid",
      "name": "nom",
      "label": "Votre nom",
      "field_type": "text",
      "is_required": true,
      "display_order": 0,
      "placeholder": "Jean Dupont"
    }
  ]
}
```

### `POST /api/v1/artisans/{slug}/forms/{form_slug}/submit/`

Soumet le formulaire.

```json
{
  "submitter_name": "Jean Dupont",
  "submitter_email": "jean@exemple.fr",
  "data": {
    "nom": "Jean Dupont",
    "message": "Bonjour, j'aimerais commander…"
  }
}
```

**Réponse 201**
```json
{
  "id": "uuid",
  "status": "new",
  "created_at": "2026-06-13T10:00:00Z"
}
```

---

## 11. Checkout — Panier & Commande

### `GET /api/v1/artisans/{slug}/checkout/shipping-config`

Retourne la configuration des transporteurs activés par l'artisan (utilisé pour le widget Mondial Relay).

```json
{
  "carriers": [
    {
      "carrier": "mondial_relay",
      "enabled": true,
      "public_config": {
        "enseigne": "BDTEST13",
        "services": ["24R"]
      }
    }
  ]
}
```

### `GET /api/v1/artisans/{slug}/shipping-zones/`

Liste les zones de livraison disponibles (utilisé pour le mode `home_delivery`).

```json
[
  {
    "id": "uuid",
    "name": "France métropolitaine",
    "countries": ["FR", "BE", "CH"],
    "price": "5.90",
    "free_above": "50.00"
  }
]
```

### `POST /api/v1/artisans/{slug}/checkout/validate`

Valide le panier, calcule les frais de port et retourne un récapitulatif.

**Requête**
```json
{
  "items": [
    { "product_id": "uuid", "quantity": 2, "custom_fields": {} }
  ],
  "country": "FR",
  "shipping_method": "mondial_relay"
}
```

`shipping_method` — optionnel. Si `"mondial_relay"`, le tarif est calculé via l'API Mondial Relay (poids réel + marge artisan). Sinon, utilise les zones de livraison.

**Réponse 200**
```json
{
  "items": [
    { "product_id": "uuid", "valid": true, "errors": [] }
  ],
  "subtotal": "56.00",
  "shipping_cost": "5.90",
  "estimated_tax": "0.00",
  "total": "61.90",
  "shipping_zones_available": [
    { "id": "uuid", "name": "France", "price": "5.90", "free_above": "50.00" }
  ]
}
```

### `POST /api/v1/artisans/{slug}/checkout/create-session`

Crée une commande (statut `pending_payment`) et une session Stripe Checkout. Rediriger le client vers `session_url`.

**Requête**
```json
{
  "items": [
    { "product_id": "uuid", "quantity": 1, "custom_fields": {} }
  ],
  "customer_email": "client@exemple.fr",
  "customer_first_name": "Jean",
  "customer_last_name": "Durand",
  "shipping_address": {
    "line1": "12 rue des Lilas",
    "city": "Paris",
    "postal_code": "75001",
    "country": "FR"
  },
  "shipping_method": "mondial_relay",
  "pickup_point_id": "034976",
  "success_url": "https://boutique.artisan.fr/commande/succes?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://boutique.artisan.fr/panier"
}
```

`shipping_method` — `"home_delivery"` ou `"mondial_relay"` (optionnel).
`pickup_point_id` — obligatoire si `shipping_method = "mondial_relay"`.

**Réponse 200**
```json
{
  "session_url": "https://checkout.stripe.com/pay/cs_test_xxx",
  "order_id": "uuid",
  "token": "uuid"
}
```

**Remarques :**
- Le panier est géré côté client (localStorage/state). L'API ne stocke pas de panier.
- Stripe Checkout est une page hébergée par Stripe — le client est redirigé après le paiement vers `success_url`.
- Les champs personnalisés `customer_facing` doivent être collectés avant l'appel à `create-session` et envoyés dans chaque `custom_fields` de chaque item.

---

## 12. Suivi de commande

### `GET /api/v1/public/orders/{token}/`

Suivi de commande sans authentification. Le `token` est envoyé par email au client après confirmation de paiement.

```json
{
  "status": "confirmed",
  "total": "61.90",
  "currency": "EUR",
  "paid_at": "2026-06-13T10:30:00Z",
  "created_at": "2026-06-13T10:25:00Z",
  "items": [
    {
      "product_snapshot": { "name": "Bol en argile", "slug": "bol-argile", "image_url": "https://api.cfng.fr/media/bol.jpg" },
      "quantity": 1,
      "unit_price": "28.00",
      "subtotal": "28.00"
    }
  ],
  "status_history": [
    { "from_status": null, "to_status": "confirmed", "created_at": "2026-06-13T10:30:00Z" }
  ]
}
```

---

## 13. Site chapeau (catalogue global)

### `GET /api/v1/catalog/`

Liste tous les artisans actifs de la plateforme.

| Paramètre | Type | Description |
|---|---|---|
| `featured_only` | bool | Filtrer les artisans mis en avant |
| `page` / `page_size` | int | Pagination |

Chaque item a la même forme que la réponse de `GET /api/v1/artisans/{slug}/`.

### `GET /api/v1/catalog/products/`

Liste tous les produits publiés de toutes les boutiques.

| Paramètre | Type | Description |
|---|---|---|
| `is_featured` | bool | Filtrer les produits mis en avant |
| `page` / `page_size` | int | Pagination |

---

## 14. Médias — URLs

Les URLs de médias dans les réponses sont déjà absolues si le backend est configuré avec une URL publique, ou relatives (`/media/filename.jpg`) en développement local. En production, configurer `MEDIA_URL_PREFIX` avec l'URL complète du serveur ou du CDN :

```
MEDIA_URL_PREFIX=https://api.cfng.fr/media
```

Pour afficher une image avec Next.js, ajouter le domaine dans `next.config.js` :

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.cfng.fr" }
    ]
  }
}
```

---

## 15. Recommandations d'architecture

### Framework recommandé : Next.js (App Router)

Next.js avec le App Router est la solution recommandée pour le site artisan. Elle s'aligne avec l'admin et offre trois stratégies de rendu, adaptées selon le contenu :

| Page | Stratégie | Raison |
|---|---|---|
| Page d'accueil / profil | ISR (`revalidate: 3600`) | Change rarement, SEO important |
| Catalogue produits | ISR (`revalidate: 600`) | Mis à jour plusieurs fois/jour |
| Détail produit | ISR (`revalidate: 300`) | SEO prioritaire, changement modéré |
| Articles de blog | SSG au build + ISR | Contenu stable |
| Résultats de recherche | SSR ou Client | Query dynamique |

**Exemple de Server Component avec ISR :**

```tsx
// app/page.tsx
export const revalidate = 3600;

async function getArtisan() {
  const res = await fetch(`${process.env.API_URL}/api/v1/artisans/marie-ceramique/`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error("Artisan introuvable");
  return res.json();
}

export default async function HomePage() {
  const artisan = await getArtisan();
  return <h1>{artisan.name}</h1>;
}
```

### Client de fetch minimal

Un client typé simple suffit pour la grande majorité des besoins :

```ts
// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(
  path: string,
  options?: { params?: Record<string, string>; method?: string; body?: string }
): Promise<T> {
  const url = new URL(API + path);
  if (options?.params) Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  const fetchOpts: RequestInit = {};
  if (options?.method) fetchOpts.method = options.method;
  if (options?.body) fetchOpts.body = options.body;
  if (options?.method && options.method !== "GET") {
    fetchOpts.headers = { "Content-Type": "application/json" };
  }
  const res = await fetch(url.toString(), fetchOpts);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// Artisan
export const getArtisan = (slug: string) =>
  apiFetch<Artisan>(`/api/v1/artisans/${slug}/`);

// Produits
export const getProducts = (slug: string, params?: Record<string, string>) =>
  apiFetch<PaginatedResponse<Product>>(`/api/v1/artisans/${slug}/products/`, { params });

// Classements
export const getProductTaxonomies = (slug: string) =>
  apiFetch<ProductTaxonomy[]>(`/api/v1/artisans/${slug}/product-taxonomies/`);

// Catégories
export const getCategories = (slug: string) =>
  apiFetch<Category[]>(`/api/v1/artisans/${slug}/categories/`);

// Schéma champs custom
export const getFieldSchema = (slug: string) =>
  apiFetch<CustomFieldDefinition[]>(`/api/v1/artisans/${slug}/field-schema/`);

// Contenu rédactionnel
export const getPages = (slug: string) =>
  apiFetch<Page[]>(`/api/v1/artisans/${slug}/pages/`);

export const getPage = (slug: string, pageSlug: string) =>
  apiFetch<Page>(`/api/v1/artisans/${slug}/pages/${pageSlug}/`);

export const getBlogPosts = (slug: string, params?: Record<string, string>) =>
  apiFetch<PaginatedResponse<BlogPost>>(`/api/v1/artisans/${slug}/blog/`, params);

export const getGalleries = (slug: string) =>
  apiFetch<Gallery[]>(`/api/v1/artisans/${slug}/galleries/`);

export const getTestimonials = (slug: string, params?: Record<string, string>) =>
  apiFetch<PaginatedResponse<Testimonial>>(`/api/v1/artisans/${slug}/testimonials/`, params);

export const getMenus = (slug: string) =>
  apiFetch<Menu[]>(`/api/v1/artisans/${slug}/menus/`);

// Blocs éditoriaux
export const getEditorialBlocks = (slug: string) =>
  apiFetch<EditorialBlock[]>(`/api/v1/artisans/${slug}/editorial-blocks/`);

// Formulaires
export const getForm = (slug: string, formSlug: string) =>
  apiFetch<Form>(`/api/v1/artisans/${slug}/forms/${formSlug}/`);

export const submitForm = (slug: string, formSlug: string, data: object) =>
  apiFetch<FormSubmission>(`/api/v1/artisans/${slug}/forms/${formSlug}/submit/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Checkout
export const getShippingConfig = (slug: string) =>
  apiFetch<ShippingConfig>(`/api/v1/artisans/${slug}/checkout/shipping-config/`);

export const validateCheckout = (slug: string, data: object) =>
  apiFetch<CheckoutValidation>(`/api/v1/artisans/${slug}/checkout/validate`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createCheckoutSession = (slug: string, data: object) =>
  apiFetch<CheckoutSession>(`/api/v1/artisans/${slug}/checkout/create-session`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Suivi commande
export const getOrderByToken = (token: string) =>
  apiFetch<OrderPublic>(`/api/v1/public/orders/${token}/`);
```

### Variables d'environnement côté frontend

```
# .env.local
NEXT_PUBLIC_API_URL=https://api.cfng.fr
API_URL=https://api.cfng.fr          # server-side (sans NEXT_PUBLIC)
ARTISAN_SLUG=marie-ceramique         # slug de l'artisan pour ce déploiement
```

### Déploiement sur Vercel

Vercel est la solution recommandée pour un premier déploiement, notamment parce que le projet utilise Next.js. Avantages concrets :

- **Zéro configuration** pour Next.js (ISR, Image Optimization, Edge middleware natifs)
- **Déploiements de prévisualisation** automatiques par branche Git — utile pour valider les changements de contenu avant mise en ligne
- **CDN global** avec revalidation ISR fonctionnelle sans configuration serveur
- **Domaines custom** gratuits (certificat SSL automatique)

Points d'attention :

- Configurer `CORS_ORIGINS` dans le backend `.env` avec `https://monartisan.fr` avant le premier déploiement
- `MEDIA_URL_PREFIX` doit être une URL publique accessible depuis Vercel (le serveur local docker n'est pas accessible depuis l'extérieur — configurer un reverse proxy nginx ou migrer vers S3/R2 pour la production)
- Les variables d'environnement se configurent dans *Vercel Dashboard → Project → Settings → Environment Variables*
- Préférer `API_URL` (server-only) à `NEXT_PUBLIC_API_URL` pour les Server Components afin de ne pas exposer l'URL interne au navigateur

**Alternative auto-hébergée :** si le backend tourne sur un VPS, le frontend peut être buildé en Docker (`next build` + `next start`) et servi via nginx sur le même VPS. Cela simplifie le CORS (même domaine via proxy) et évite les contraintes de Vercel, mais demande plus de maintenance infrastructure.
