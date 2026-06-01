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
  track_inventory?: boolean;
  stock_quantity?: number | null;
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

    const maxQty = item.track_inventory && item.stock_quantity != null
      ? item.stock_quantity
      : Infinity;

    if (idx >= 0) {
      const copy = [...items];
      const newQty = Math.min(copy[idx].quantity + item.quantity, maxQty);
      copy[idx] = { ...copy[idx], quantity: newQty };
      persist(copy);
    } else {
      const newQty = Math.min(item.quantity, maxQty);
      persist([...items, { ...item, quantity: newQty }]);
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
