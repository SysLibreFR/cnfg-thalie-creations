# Guide de migration — Catégories → Classements

> :warning: Ce document s'adresse au développeur du **site vitrine artisan** (frontend public, projet externe). L'interface d'administration a déjà été migrée.

## 1. Endpoints modifiés

### `GET /api/v1/artisans/{slug}/categories/` → `GET /api/v1/artisans/{slug}/product-taxonomies/`

**Ancienne réponse :**
```json
[
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "parent_id": null,
    "name": "Bols",
    "slug": "bols",
    "description": null,
    "sort_order": 0
  }
]
```

**Nouvelle réponse :**
```json
[
  {
    "id": "uuid",
    "artisan_id": "uuid",
    "name": "Catégories",
    "slug": "categories",
    "description": "Classement par catégories",
    "selection_type": "single",
    "sort_order": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "terms": [
      {
        "id": "uuid",
        "product_taxonomy_type_id": "uuid",
        "name": "Bols",
        "slug": "bols",
        "emoji": "🥣",
        "image_url": null,
        "sort_order": 0,
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "uuid",
        "product_taxonomy_type_id": "uuid",
        "name": "Vases",
        "slug": "vases",
        "emoji": null,
        "image_url": null,
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
]
```

L'artisan peut avoir **plusieurs types de classement** (ex: "Catégories", "Matériaux", "Couleurs"). Chaque type a :

| Champ | Description |
|---|---|
| `selection_type` | `"single"` (dropdown/radios) ou `"multiple"` (checkboxes) |
| `terms[].emoji` | Emoji optionnel pour affichage |
| `terms[].image_url` | Image optionnelle pour affichage |

Il n'y a plus de hiérarchie (`parent_id` a été supprimé).

---

## 2. Réponse produit — champ supprimé et ajouté

**`category_id`** a été supprimé de la réponse produit. Il est remplacé par **`taxonomy_terms`** :

```diff
 {
   "id": "uuid",
   "artisan_id": "uuid",
   "name": "Bol raku noir",
   "slug": "bol-raku-noir",
   "price": "45.00",
-  "category_id": "uuid-ou-null",
+  "taxonomy_terms": [
+    {
+      "id": "uuid",
+      "product_taxonomy_type_id": "uuid",
+      "name": "Bols",
+      "slug": "bols",
+      "emoji": null,
+      "image_url": null,
+      "sort_order": 0,
+      "created_at": "2024-01-01T00:00:00Z"
+    }
+  ],
   "tags": ["céramique", "raku"]
 }
```

---

## 3. Filtrage des produits

Le paramètre `category_slug` est remplacé par `term_ids` (UUIDs séparés par des virgules) :

```diff
- GET /api/v1/artisans/{slug}/products/?category_slug=bols
+ GET /api/v1/artisans/{slug}/products/?term_ids=550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001
```

---

## 4. Types TypeScript

```diff
-// ❌ À supprimer
-interface Category {
-  id: string;
-  artisan_id: string;
-  parent_id: string | null;
-  name: string;
-  slug: string;
-  description: string | null;
-  sort_order: number;
-}

+// ✅ Nouveaux types
+interface ProductTaxonomyTerm {
+  id: string;
+  product_taxonomy_type_id: string;
+  name: string;
+  slug: string;
+  emoji: string | null;
+  image_url: string | null;
+  sort_order: number;
+  created_at: string;
+}
+
+interface ProductTaxonomyType {
+  id: string;
+  artisan_id: string;
+  name: string;
+  slug: string;
+  description: string | null;
+  selection_type: "single" | "multiple";
+  sort_order: number;
+  created_at: string;
+  updated_at: string;
+  terms: ProductTaxonomyTerm[];
+}

 // ✅ Product mis à jour
 interface Product {
   // ...
+  taxonomy_terms: ProductTaxonomyTerm[];
-  category_id: string | null;  // supprimé
 }
```

---

## 5. Fonctions API client

```diff
-// ❌ Ancienne fonction
-export const getCategories = (slug: string) =>
-  apiFetch<Category[]>(`/api/v1/artisans/${slug}/categories/`);

+// ✅ Nouvelle fonction
+export const getProductTaxonomies = (slug: string) =>
+  apiFetch<ProductTaxonomyType[]>(`/api/v1/artisans/${slug}/product-taxonomies/`);

 // ✅ Filtrage produit mis à jour (inchangé, juste le paramètre change)
 export const getProducts = (slug: string, params?: Record<string, string>) =>
   apiFetch<PaginatedResponse<Product>>(`/api/v1/artisans/${slug}/products/`, params);
 
-// Utilisation ancienne :
-getProducts("mon-artisan", { category_slug: "bols" })
+// Utilisation nouvelle :
+getProducts("mon-artisan", { term_ids: "uuid1,uuid2" })
```

---

## 6. Affichage des classements sur le site

Pour chaque type de classement, adapter le rendu selon `selection_type` :

```tsx
{taxonomies.map(tax => (
  <div key={tax.id}>
    <h3>{tax.name}</h3>

    {tax.selection_type === "single" ? (
      <select onChange={e => onFilter(e.target.value)}>
        <option value="">Tous</option>
        {tax.terms.map(t => (
          <option key={t.id} value={t.id}>
            {t.emoji && `${t.emoji} `}{t.name}
          </option>
        ))}
      </select>
    ) : (
      <div>
        {tax.terms.map(t => (
          <label key={t.id}>
            <input
              type="checkbox"
              checked={selectedTermIds.includes(t.id)}
              onChange={() => toggleTerm(t.id)}
            />
            {t.emoji && <span>{t.emoji}</span>}
            {t.image_url && (
              <img src={t.image_url} alt="" className="w-5 h-5 rounded" />
            )}
            {t.name}
          </label>
        ))}
      </div>
    )}
  </div>
))}
```

Pour construire l'URL de filtre à envoyer à l'API :

```ts
// Single-select
const termIds = selectedTermId ?? "";

// Multi-select
const termIds = selectedTermIds.join(",");

const products = await getProducts(slug, { term_ids: termIds });
```

---

## 7. CustomFieldDefinition

Le champ `category_id` des définitions de champs personnalisés a été renommé en `product_taxonomy_term_id` :

```diff
 interface CustomFieldDefinition {
   id: string;
   artisan_id: string;
-  category_id: string | null;
+  product_taxonomy_term_id: string | null;
   name: string;
   label: string;
   field_type: string;
   // ...
 }
```

Si le site filtre l'affichage des champs custom par produit/catégorie, utiliser désormais `product_taxonomy_term_id`.
