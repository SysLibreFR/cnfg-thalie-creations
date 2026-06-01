# Guide d'intégration du panier — Site artisan

## Architecture

Le panier est **100 % côté client** (localStorage). L'API ne stocke pas de panier, elle ne fait que :

1. **Valider** les articles et estimer les frais
2. **Créer une commande + une session Stripe** pour le paiement

```
┌──────────────────┐       ┌─────────────────────────────────────┐
│    NAVIGATEUR    │       │              BACKEND                │
│                  │       │                                     │
│  localStorage    │       │  POST /checkout/validate            │
│  cart: [...]     │──────→│  → validation stock + champs        │
│                  │       │  → estimation frais de port         │
│                  │       │                                     │
│                  │       │  POST /checkout/create-session      │
│                  │──────→│  → création Order (pending_payment) │
│                  │       │  → création Stripe Checkout Session │
│                  │       │  → retour { session_url }           │
│                  │       │                                     │
│  window.location ├──────→│  STRIPE CHECKOUT (page hébergée)    │
│  = session_url   │       │  → client paie                      │
│                  │       │  → Stripe redirige vers success_url │
│                  │       │                                     │
│  Page succès     │←──────│  (webhook Stripe → order confirmed) │
└──────────────────┘       └─────────────────────────────────────┘
```

---

## 1. Types TypeScript

Ajouter ces types dans `lib/types.ts` du site artisan :

```typescript
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

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string | null;
  compare_at_price: string | null;
  images: Array<{ url: string; alt_text: string; is_cover: boolean }>;
  stock_quantity: number | null;
  track_inventory: boolean;
  custom_fields: Record<string, unknown>;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  field_type: string;
  options: Array<{ value: string; label: string }>;
  is_required: boolean;
  customer_facing: boolean;
  customer_facing_label: string | null;
  help_text: string;
}
```

---

## 2. Fonctions API

Ajouter dans `lib/api.ts` du site artisan :

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const SLUG = process.env.NEXT_PUBLIC_ARTISAN_SLUG ?? "";

// ── Panier & Checkout ────────────────────────────────────────────────────

export async function validateCheckout(data: {
  items: CheckoutItem[];
  country: string;
}): Promise<ValidateResponse> {
  const res = await fetch(`${API_URL}/api/v1/artisans/${SLUG}/checkout/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
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
  const res = await fetch(`${API_URL}/api/v1/artisans/${SLUG}/checkout/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  const res = await fetch(`${API_URL}/api/v1/artisans/${SLUG}/shipping-zones/`);
  if (!res.ok) return [];
  return res.json();
}

export async function trackOrder(token: string): Promise<OrderPublic> {
  const res = await fetch(`${API_URL}/api/v1/public/orders/${token}/`);
  if (!res.ok) throw new Error("Commande introuvable");
  return res.json();
}

export async function getFieldSchema(): Promise<CustomFieldDefinition[]> {
  const res = await fetch(`${API_URL}/api/v1/artisans/${SLUG}/field-schema/`);
  if (!res.ok) return [];
  return res.json();
}
```

---

## 3. Hook panier (React)

`hooks/useCart.ts` :

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
  /** mapped field_definition_id → value */
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

  /** Ajoute un article ou incrémente la quantité si déjà présent (mêmes custom_fields) */
  function add(item: CartItem) {
    const idx = items.findIndex(
      i => i.product_id === item.product_id
        && JSON.stringify(i.custom_fields) === JSON.stringify(item.custom_fields)
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
    persist(items.filter(i =>
      i.product_id !== product_id
      || (customFields && JSON.stringify(i.custom_fields) !== JSON.stringify(customFields))
    ));
  }

  function updateQuantity(product_id: string, quantity: number, customFields?: Record<string, string>) {
    if (quantity < 1) return remove(product_id, customFields);
    persist(items.map(i =>
      i.product_id === product_id
      && (!customFields || JSON.stringify(i.custom_fields) === JSON.stringify(customFields))
        ? { ...i, quantity }
        : i
    ));
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

## 4. Page produit — « Ajouter au panier »

`app/boutique/[slug]/page.tsx` (composant client) :

```tsx
"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { getFieldSchema } from "@/lib/api";
import type { Product, CustomFieldDefinition } from "@/lib/types";

interface Props {
  product: Product;
}

export default function AddToCartSection({ product }: Props) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [fieldSchema, setFieldSchema] = useState<CustomFieldDefinition[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getFieldSchema().then(setFieldSchema);
  }, []);

  const customerFields = fieldSchema.filter(f => f.customer_facing);

  function handleAdd() {
    // Validation des champs requis
    for (const f of customerFields) {
      if (f.is_required && !customFields[f.id]) {
        alert(`Veuillez remplir le champ "${f.customer_facing_label || f.label}"`);
        return;
      }
    }

    add({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price ?? "0"),
      image_url: product.images?.find(i => i.is_cover)?.url ?? product.images?.[0]?.url ?? "",
      quantity,
      custom_fields: customFields,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const isOutOfStock = product.track_inventory && product.stock_quantity !== null && product.stock_quantity <= 0;

  return (
    <div className="space-y-4">
      {/* Champ personnalisés client */}
      {customerFields.map(f => (
        <div key={f.id}>
          <label className="block text-sm font-medium mb-1">
            {f.customer_facing_label || f.label}
            {f.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {f.help_text && <p className="text-xs text-gray-500 mb-1">{f.help_text}</p>}

          {f.field_type === "select" ? (
            <select
              value={customFields[f.id] ?? ""}
              onChange={e => setCustomFields(cf => ({ ...cf, [f.id]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">— Choisir —</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : f.field_type === "multiselect" ? (
            <div className="flex flex-wrap gap-2">
              {f.options.map(o => (
                <label key={o.value} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={(customFields[f.id] ?? "").split(",").includes(o.value)}
                    onChange={e => {
                      const current = (customFields[f.id] ?? "").split(",").filter(Boolean);
                      const next = e.target.checked
                        ? [...current, o.value]
                        : current.filter(v => v !== o.value);
                      setCustomFields(cf => ({ ...cf, [f.id]: next.join(",") }));
                    }}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          ) : f.field_type === "textarea" ? (
            <textarea
              value={customFields[f.id] ?? ""}
              onChange={e => setCustomFields(cf => ({ ...cf, [f.id]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          ) : (
            <input
              type={f.field_type === "number" ? "number" : "text"}
              value={customFields[f.id] ?? ""}
              onChange={e => setCustomFields(cf => ({ ...cf, [f.id]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            />
          )}
        </div>
      ))}

      {/* Quantité */}
      <div>
        <label className="block text-sm font-medium mb-1">Quantité</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 border rounded-lg"
          >−</button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-10 h-10 border rounded-lg"
          >+</button>
        </div>
      </div>

      {/* Prix */}
      <p className="text-2xl font-bold">
        {product.price ? `${(parseFloat(product.price) * quantity).toFixed(2)} €` : "Prix sur demande"}
      </p>

      {/* Bouton */}
      {isOutOfStock ? (
        <p className="text-red-600 font-medium">Produit épuisé</p>
      ) : product.price_on_request ? (
        <button className="w-full py-3 rounded-lg bg-gray-200 text-gray-600 cursor-not-allowed">
          Prix sur demande
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
        >
          {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
        </button>
      )}
    </div>
  );
}
```

---

## 5. Mini panier (badge navbar + drawer)

### Badge dans la navbar

```tsx
"use client";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/panier" className="relative">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
```

### Page panier

`app/panier/page.tsx` :

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

export default function PanierPage() {
  const { items, loaded, updateQuantity, remove, total, clear } = useCart();
  const router = useRouter();

  if (!loaded) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Découvrez nos créations dans la boutique.</p>
        <Link href="/boutique"
          className="inline-block px-6 py-3 rounded-lg font-medium"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Votre panier</h1>

      <div className="divide-y border-t border-b mb-6">
        {items.map((item, idx) => (
          <div key={`${item.product_id}-${idx}`} className="flex gap-4 py-4">
            {item.image_url && (
              <img src={item.image_url} alt={item.name}
                className="w-20 h-20 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/boutique/${item.slug}`} className="font-medium hover:underline">
                {item.name}
              </Link>
              {Object.keys(item.custom_fields).length > 0 && (
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {Object.entries(item.custom_fields).map(([fid, val]) => (
                    <span key={fid} className="block">{fid}: {val}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.custom_fields)}
                  className="w-8 h-8 border rounded text-sm">−</button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.custom_fields)}
                  className="w-8 h-8 border rounded text-sm">+</button>
                <button onClick={() => remove(item.product_id, item.custom_fields)}
                  className="text-sm text-red-600 ml-2">Supprimer</button>
              </div>
            </div>
            <p className="font-medium shrink-0">{item.price.toFixed(2)} €</p>
          </div>
        ))}
      </div>

      <div className="text-right mb-8">
        <p className="text-lg font-bold">Total : {total.toFixed(2)} €</p>
      </div>

      <div className="flex justify-between">
        <button onClick={clear} className="text-sm text-gray-500 hover:underline">Vider le panier</button>
        <Link href="/checkout"
          className="px-8 py-3 rounded-lg font-medium"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
          Commander
        </Link>
      </div>
    </div>
  );
}
```

---

## 6. Page checkout

`app/checkout/page.tsx` (composant client) :

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { validateCheckout, createCheckoutSession, getShippingZones } from "@/lib/api";
import type { ShippingZone } from "@/lib/types";

export default function CheckoutPage() {
  const { items, total, clear, loaded } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [error, setError] = useState("");
  const [zones, setZones] = useState<ShippingZone[]>([]);

  // Formulaire
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    line1: "", line2: "", city: "", postal_code: "", country: "FR",
  });
  const [notes, setNotes] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  useEffect(() => {
    getShippingZones().then(setZones);
  }, []);

  if (!loaded) return null;
  if (items.length === 0) {
    router.push("/panier");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    setError("");

    try {
      const session = await createCheckoutSession({
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          custom_fields: i.custom_fields,
        })),
        customer_email: email,
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: phone || undefined,
        shipping_address: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          postal_code: address.postal_code,
          country: address.country,
        },
        shipping_zone_id: selectedZone || undefined,
        notes: notes || undefined,
        success_url: `${window.location.origin}/checkout/success?order_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/panier`,
      });

      window.location.href = session.session_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
      setStep("form");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finaliser la commande</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité */}
        <fieldset>
          <legend className="font-medium mb-3">Vos informations</legend>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Prénom" value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full" />
            <input required placeholder="Nom" value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full" />
          </div>
          <input required type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mt-4" />
          <input type="tel" placeholder="Téléphone (optionnel)" value={phone}
            onChange={e => setPhone(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mt-4" />
        </fieldset>

        {/* Adresse */}
        <fieldset>
          <legend className="font-medium mb-3">Adresse de livraison</legend>
          <input required placeholder="Adresse" value={address.line1}
            onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
            className="border rounded-lg px-3 py-2 w-full" />
          <input placeholder="Complément (optionnel)" value={address.line2}
            onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
            className="border rounded-lg px-3 py-2 w-full mt-4" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <input required placeholder="Code postal" value={address.postal_code}
              onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full col-span-1" />
            <input required placeholder="Ville" value={address.city}
              onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full col-span-2" />
          </div>
          <select value={address.country}
            onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
            className="border rounded-lg px-3 py-2 w-full mt-4">
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="LU">Luxembourg</option>
            <option value="MC">Monaco</option>
            <option value="DE">Allemagne</option>
            <option value="IT">Italie</option>
            <option value="ES">Espagne</option>
          </select>
        </fieldset>

        {/* Zone de livraison */}
        {zones.length > 0 && (
          <fieldset>
            <legend className="font-medium mb-3">Mode de livraison</legend>
            {zones.map(z => (
              <label key={z.id}
                className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input type="radio" name="shipping_zone"
                    checked={selectedZone === z.id}
                    onChange={() => setSelectedZone(z.id)} />
                  <div>
                    <p className="font-medium text-sm">{z.name}</p>
                    <p className="text-xs text-gray-500">
                      {z.countries.join(", ")}
                      {z.free_above && ` — gratuit dès ${z.free_above} €`}
                    </p>
                  </div>
                </div>
                <span className="font-medium text-sm">
                  {z.free_above && total >= parseFloat(z.free_above) ? "Gratuit" : `${z.price} €`}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {/* Notes */}
        <fieldset>
          <legend className="font-medium mb-3">Note pour l'artisan (optionnelle)</legend>
          <textarea value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Indications spéciales pour la livraison…"
            rows={3}
            className="border rounded-lg px-3 py-2 w-full" />
        </fieldset>

        {/* Récapitulatif */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-gray-600">{items.length} article(s)</span>
            <span>{total.toFixed(2)} €</span>
          </p>
          <p className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total estimé</span>
            <span>{total.toFixed(2)} €</span>
          </p>
        </div>

        <button type="submit" disabled={step === "loading"}
          className="w-full py-3 rounded-lg font-medium text-lg transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
          {step === "loading" ? "Redirection vers Stripe…" : "Payer par carte"}
        </button>
      </form>
    </div>
  );
}
```

---

## 7. Page de succès

`app/checkout/success/page.tsx` :

```tsx
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-6">✅</div>
      <h1 className="text-2xl font-bold mb-4">Votre commande est confirmée !</h1>
      <p className="text-gray-600 mb-2">
        Vous allez recevoir un email de confirmation avec un lien de suivi.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        L'artisan vous tiendra informé de l'avancement de votre commande.
      </p>
      <Link href="/boutique"
        className="inline-block px-6 py-3 rounded-lg font-medium"
        style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
        Retour à la boutique
      </Link>
    </div>
  );
}
```

---

## 8. Page de suivi de commande

`app/suivi/[token]/page.tsx` (server component with client reload) :

```tsx
import { trackOrder } from "@/lib/api";
import { notFound } from "next/navigation";
import ClientTracker from "./client";

export const revalidate = 0;

export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const order = await trackOrder(token);
    return <ClientTracker order={order} token={token} />;
  } catch {
    notFound();
  }
}
```

`app/suivi/[token]/client.tsx` (composant client avec rafraîchissement auto) :

```tsx
"use client";

import { useState, useEffect } from "react";
import { trackOrder } from "@/lib/api";
import type { OrderPublic } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Paiement en attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"];

export default function ClientTracker({ order: initial, token }: { order: OrderPublic; token: string }) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    if (order.status === "delivered" || order.status === "cancelled") return;
    const interval = setInterval(async () => {
      try {
        const updated = await trackOrder(token);
        setOrder(updated);
      } catch { /* ignore */ }
    }, 15_000);
    return () => clearInterval(interval);
  }, [order.status, token]);

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Suivi de commande</h1>
      <p className="text-sm text-gray-500 mb-8">
        Commande du {new Date(order.created_at).toLocaleDateString("fr-FR")}
      </p>

      {/* Statut actuel */}
      <div className="mb-8 p-4 rounded-lg text-center font-medium"
        style={{
          background: order.status === "cancelled" ? "#fef2f2" : "#f0fdf4",
          color: order.status === "cancelled" ? "#991b1b" : "#166534",
        }}>
        {STATUS_LABELS[order.status] ?? order.status}
      </div>

      {/* Barre de progression */}
      {order.status !== "cancelled" && order.status !== "pending_payment" && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STATUS_STEPS.map((s, i) => (
              <span key={s} className="text-xs font-medium"
                style={{ color: i <= currentStep ? "var(--color-primary)" : "#d1d5db" }}>
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%`,
                background: "var(--color-primary)",
              }} />
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="divide-y border-t mb-6">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-3">
            <div>
              <p className="font-medium text-sm">{item.product_snapshot.name}</p>
              <p className="text-xs text-gray-500">x{item.quantity}</p>
              {item.customizations && Object.values(item.customizations).map((c, ci) => (
                <p key={ci} className="text-xs text-gray-400">
                  {c.label} : {c.label_value ?? String(c.value)}
                </p>
              ))}
            </div>
            <p className="font-medium text-sm">{item.subtotal} €</p>
          </div>
        ))}
      </div>

      <p className="text-right font-bold">Total : {order.total} €</p>
    </div>
  );
}
```

---

## 9. Gestion des erreurs courantes

| Situation | Code erreur | Cause | Solution frontend |
|-----------|-------------|-------|-------------------|
| Artisan sans Stripe Connect | `400` | `stripe_onboarding_completed = false` | Cacher le bouton "Ajouter au panier" ou afficher un message "Boutique temporairement indisponible" |
| Produit épuisé | `400` | `stock_quantity < quantity` | Afficher "Produit épuisé", désactiver le bouton |
| Stock insuffisant | `400` | Stock partiel | Indiquer la quantité disponible |
| Champs personnalisés invalides | `400` | Champ requis manquant, valeur select invalide | Valider avant d'envoyer, afficher les erreurs champ par champ |
| Session Stripe expirée | — | Client n'a pas payé dans le délai | Ne rien faire côté frontend (le webhook annule la commande automatiquement) |
| Token de suivi invalide | `404` | Mauvais token | Afficher "Commande introuvable" |

---

## 10. Recommandations

1. **Ne pas stocker le panier côté serveur.** localStorage suffit — le checkout est validé par l'API avant paiement.

2. **Toujours appeler `validate` avant `create-session`** pour éviter les surprises (rupture de stock entre la navigation et le paiement).

3. **Paramétrer `success_url` et `cancel_url`** avec des vraies pages. Stripe redirige le client après paiement :
   - `success_url` : afficher une page de confirmation + envoyer le `token` de suivi par email (c'est le webhook qui s'en charge)
   - `cancel_url` : retour au panier avec les articles intacts

4. **Les champs `customer_facing`** sont mappés par l'ID de la définition (`field_definition_id` → valeur). La page produit doit les afficher dynamiquement en fonction de `field_type` (select → liste déroulante, text → input, etc.).

5. **Le suivi de commande** rafraîchit automatiquement le statut toutes les 15 secondes. Le client peut voir l'avancement sans se connecter.

6. **Les emails** (confirmation, notification artisan, mise à jour statut) sont envoyés automatiquement par le backend — le site artisan n'a rien à gérer de ce côté.
