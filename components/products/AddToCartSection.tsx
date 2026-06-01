"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { getClientFieldSchema } from "@/lib/api";
import type { Product, FieldSchemaDef } from "@/lib/types";

interface Props {
  product: Product;
}

export default function AddToCartSection({ product }: Props) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [fieldSchema, setFieldSchema] = useState<FieldSchemaDef[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getClientFieldSchema().then(setFieldSchema);
  }, []);

  const customerFields = fieldSchema.filter((f) => f.customer_facing);

  function handleAdd() {
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
      image_url:
        product.images?.find((i) => i.is_cover)?.url ??
        product.images?.[0]?.url ??
        "",
      quantity,
      custom_fields: customFields,
      track_inventory: product.track_inventory,
      stock_quantity: product.stock_quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const isOutOfStock =
    product.track_inventory &&
    product.stock_quantity !== null &&
    product.stock_quantity <= 0;

  const maxQty = product.track_inventory && product.stock_quantity != null
    ? product.stock_quantity
    : Infinity;

  const showAddToCart = !product.price_on_request && !isOutOfStock;
  const isPriceOnRequest = product.price_on_request;

  return (
    <div className="space-y-4" style={{ marginBottom: "24px" }}>
      {/* Champs personnalisés client */}
      {customerFields.map((f) => (
        <div key={f.id}>
          <label className="block text-sm font-medium mb-1">
            {f.customer_facing_label || f.label}
            {f.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {f.help_text && (
            <p className="text-xs text-gray-500 mb-1">{f.help_text}</p>
          )}

          {f.field_type === "select" ? (
            <select
              value={customFields[f.id] ?? ""}
              onChange={(e) =>
                setCustomFields((cf) => ({ ...cf, [f.id]: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">— Choisir —</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.field_type === "multiselect" ? (
            <div className="flex flex-wrap gap-2">
              {f.options.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center gap-1 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={(customFields[f.id] ?? "")
                      .split(",")
                      .includes(o.value)}
                    onChange={(e) => {
                      const current = (customFields[f.id] ?? "")
                        .split(",")
                        .filter(Boolean);
                      const next = e.target.checked
                        ? [...current, o.value]
                        : current.filter((v) => v !== o.value);
                      setCustomFields((cf) => ({
                        ...cf,
                        [f.id]: next.join(","),
                      }));
                    }}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          ) : f.field_type === "textarea" ? (
            <textarea
              value={customFields[f.id] ?? ""}
              onChange={(e) =>
                setCustomFields((cf) => ({ ...cf, [f.id]: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          ) : (
            <input
              type={f.field_type === "number" ? "number" : "text"}
              value={customFields[f.id] ?? ""}
              onChange={(e) =>
                setCustomFields((cf) => ({ ...cf, [f.id]: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          )}
        </div>
      ))}

      {/* Quantité */}
      {showAddToCart && (
        <div>
          <label className="block text-sm font-medium mb-1">Quantité</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 border rounded-lg"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="w-10 h-10 border rounded-lg"
              disabled={quantity >= maxQty}
              style={{ opacity: quantity >= maxQty ? 0.4 : 1 }}
            >
              +
            </button>
          </div>
          {product.track_inventory && product.stock_quantity != null && (
            <p className="text-xs text-gray-500 mt-1">
              {product.stock_quantity} en stock
              {maxQty < Infinity && quantity >= maxQty && " — quantité maximale atteinte"}
            </p>
          )}
        </div>
      )}

      {/* Prix total */}
      {product.price && showAddToCart && (
        <p className="text-2xl font-bold">
          {(parseFloat(product.price) * quantity).toFixed(2)} €
        </p>
      )}

      {/* Boutons */}
      {isOutOfStock ? (
        <p className="text-red-600 font-medium">Produit épuisé</p>
      ) : isPriceOnRequest ? (
        <p className="text-sm text-gray-500 italic">
          Prix sur demande — contactez l&apos;artisane pour une commande
          personnalisée.
        </p>
      ) : (
        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{
            background: "var(--prune)",
            color: "#fff",
          }}
        >
          {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
        </button>
      )}
    </div>
  );
}
