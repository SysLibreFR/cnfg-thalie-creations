# Plan d'implémentation — Panier & Paiement

> Basé sur le document [`docs/panier.md`](./panier.md) et l'état actuel du projet.

---

## 1. Types à ajouter dans `lib/types.ts`

Ajouter en fin de fichier les interfaces suivantes :

```typescript
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
```

---

## 2. Fonctions API à ajouter dans `lib/api.ts`

Ajouter en fin de fichier (après les fonctions existantes) :

```typescript
// ── Checkout ────────────────────────────────────────────────────────────

const BASE_CLIENT = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const CLIENT_SLUG = process.env.NEXT_PUBLIC_ARTISAN_SLUG ?? "";

export async function validateCheckout(data: {
  items: CheckoutItem[];
  country: string;
}): Promise<ValidateResponse> {
  const res = await fetch(
    `${BASE_CLIENT}/api/v1/artisans/${CLIENT_SLUG}/checkout/validate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCheckoutSession(data: {
  items: CheckoutItem[];
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  billing_address?: Record<string, string>;
  shipping_zone_id?: string;
  notes?: string;
  success_url: string;
  cancel_url: string;
}): Promise<CreateSessionResponse> {
  const res = await fetch(
    `${BASE_CLIENT}/api/v1/artisans/${CLIENT_SLUG}/checkout/create-session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  const res = await fetch(
    `${BASE_CLIENT}/api/v1/artisans/${CLIENT_SLUG}/shipping-zones/`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function trackOrder(token: string): Promise<OrderPublic> {
  const res = await fetch(
    `${BASE_CLIENT}/api/v1/public/orders/${token}/`
  );
  if (!res.ok) throw new Error("Commande introuvable");
  return res.json();
}

export async function getClientFieldSchema(): Promise<CustomFieldDefinition[]> {
  const res = await fetch(
    `${BASE_CLIENT}/api/v1/artisans/${CLIENT_SLUG}/field-schema/`
  );
  if (!res.ok) return [];
  return res.json();
}
```

**Note :** `getClientFieldSchema` est une version publique (appelable depuis le navigateur) doublant `getFieldSchema` (serveur). Les imports doivent être mis à jour en tête de fichier.

---

## 3. Hook panier → `hooks/useCart.ts` (fichier à créer)

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  quantity: number;
  custom_fields: Record<string, string>;
}

const STORAGE_KEY = "artisan_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    saveCart(newItems);
  }, []);

  function add(item: CartItem) {
    const idx = items.findIndex(
      (i) =>
        i.product_id === item.product_id &&
        JSON.stringify(i.custom_fields) === JSON.stringify(item.custom_fields)
    );
    if (idx >= 0) {
      const copy = [...items];
      copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
      persist(copy);
    } else {
      persist([...items, item]);
    }
  }

  function remove(product_id: string, customFields?: Record<string, string>) {
    persist(
      items.filter(
        (i) =>
          i.product_id !== product_id ||
          (customFields &&
            JSON.stringify(i.custom_fields) !== JSON.stringify(customFields))
      )
    );
  }

  function updateQuantity(
    product_id: string,
    quantity: number,
    customFields?: Record<string, string>
  ) {
    if (quantity < 1) return remove(product_id, customFields);
    persist(
      items.map((i) =>
        i.product_id === product_id &&
        (!customFields ||
          JSON.stringify(i.custom_fields) === JSON.stringify(customFields))
          ? { ...i, quantity }
          : i
      )
    );
  }

  function clear() {
    persist([]);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, loaded, add, remove, updateQuantity, clear, total, count };
}
```

---

## 4. Composant Ajouter au panier → `components/products/AddToCartSection.tsx`

Nouveau composant client, à importer dans `app/boutique/[slug]/page.tsx` **sans retirer** le bouton `mailto` existant.

### Comportement attendu
- Sélecteur de quantité (– / +)
- Affiche les champs personnalisés `customer_facing` (depuis `getClientFieldSchema`)
- Valide les champs requis côté client avant d'ajouter
- Bouton "Ajouter au panier" (désactivé si rupture de stock ou `price_on_request`)
- Feedback visuel "✓ Ajouté au panier" pendant 2s
- Le bouton `mailto` reste présent **sous** le bloc panier

### Emplacement dans la fiche produit
Dans l'encart d'informations (`product-info-pad`), après les tags, avant `artisan?.contact?.email`.

---

## 5. Badge panier → mise à jour de `components/layout/Nav.tsx`

Ajouter un lien `/panier` avec une icône SVG de sac et un compteur.

**Option retenue :** Créer un mini-composant `CartBadge.tsx` dans `components/layout/` pour ne pas surcharger `Nav.tsx`.

**Comportement mobile :** Le badge est visible dans la nav desktop (à côté du CTA) et dans le menu mobile.

---

## 6. Page panier → `app/panier/page.tsx`

Route statique, composant client utilisant `useCart()`.

**États :**
- **Chargement :** affiche "Chargement…"
- **Vide :** message + lien "Voir la boutique"
- **Avec articles :** liste + total + actions

**Contenu :**
- Image, nom (lien vers fiche), personnalisations
- Quantité modifiable (– / + / supprimer)
- Prix unitaire
- Sous-total général
- Bouton "Vider le panier"
- Bouton "Commander" → `/checkout`

---

## 7. Page checkout → `app/checkout/page.tsx`

Composant client. Redirige vers `/panier` si le panier est vide.

**Étapes du formulaire :**
1. Identité : prénom, nom, email (obligatoires), téléphone (optionnel)
2. Adresse livraison : ligne1, ligne2, code postal, ville, pays (FR/BE/CH/LU/MC/DE/IT/ES)
3. Mode de livraison : radio depuis `getShippingZones()` (gratuit si panier ≥ seuil)
4. Note pour l'artisan (textarea optionnelle)
5. Récapitulatif : nombre articles + total estimé
6. Bouton "Payer par carte"

**Soumission :**
1. Appeler `createCheckoutSession`
2. Rediriger vers `session_url` (Stripe)
3. En cas d'erreur, afficher un message en haut du formulaire

---

## 8. Page succès → `app/checkout/success/page.tsx`

Composant serveur simple :

- Message de confirmation
- Texte : "Vous allez recevoir un email de confirmation avec un lien de suivi."
- Lien "Retour à la boutique"

---

## 9. Suivi de commande → `app/suivi/[token]/` (2 fichiers)

### `app/suivi/[token]/page.tsx` (serveur)
```tsx
import { trackOrder } from "@/lib/api";
import { notFound } from "next/navigation";
import ClientTracker from "./client";

export const revalidate = 0;

export default async function SuiviPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const order = await trackOrder(token);
    return <ClientTracker order={order} token={token} />;
  } catch {
    notFound();
  }
}
```

### `app/suivi/[token]/client.tsx` (composant client)
- Badge coloré selon le statut
- Barre de progression (confirmée → en préparation → expédiée → livrée)
- Articles commandés
- Total
- Rafraîchissement auto toutes les 15s (tant que ≠ livrée/annulée)
- Statut "Annulée" : badge rouge, pas de barre

---

## 10. Mise à jour des imports existants

### `lib/types.ts`
Ajouter les imports des nouvelles interfaces checkout.

### `lib/api.ts`
- Ajouter les imports des nouveaux types en tête
- Ajouter les fonctions checkout en fin de fichier (après `getMenu`)

### `app/boutique/[slug]/page.tsx`
- Ajouter l'import de `AddToCartSection`
- Ajouter `<AddToCartSection product={product} />` après les tags, **avant** le bouton `mailto`

---

## Ordre d'implémentation recommandé

| # | Étape | Fichier(s) | Indépendant |
|---|-------|------------|-------------|
| 1 | Types checkout | `lib/types.ts` | ✅ |
| 2 | Hook `useCart` | `hooks/useCart.ts` | ✅ |
| 3 | `AddToCartSection` | `components/products/AddToCartSection.tsx` | ✅ |
| 4 | Badge panier + `CartBadge` | `components/layout/CartBadge.tsx` + `Nav.tsx` | ✅ |
| 5 | Page panier | `app/panier/page.tsx` | ✅ |
| 6 | Fonctions API checkout | `lib/api.ts` | ✅ |
| 7 | Page checkout | `app/checkout/page.tsx` | dépend de #1, #2, #6 |
| 8 | Page succès | `app/checkout/success/page.tsx` | ✅ |
| 9 | Suivi commande | `app/suivi/[token]/page.tsx` + `client.tsx` | dépend de `trackOrder` (#6) |
