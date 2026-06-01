"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function PanierPage() {
  const { items, loaded, updateQuantity, remove, total } = useCart();

  if (!loaded) {
    return (
      <div className="section" style={{ textAlign: "center", color: "var(--text-muted)" }}>
        Chargement…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🛍️</div>
        <h1 style={{ fontSize: "24px", color: "var(--prune)", marginBottom: "12px" }}>
          Votre panier est vide
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Découvrez nos créations dans la boutique.
        </p>
        <Link href="/boutique" className="btn btn--primary">
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "28px",
          color: "var(--prune)",
          marginBottom: "32px",
        }}
      >
        Votre panier
      </h1>

      <div
        style={{
          borderTop: "1px solid var(--creme-dark)",
          borderBottom: "1px solid var(--creme-dark)",
        }}
      >
        {items.map((item, idx) => {
          const key = `${item.product_id}-${idx}`;
          const lineTotal = item.price * item.quantity;

          return (
            <div
              key={key}
              style={{
                display: "flex",
                gap: "16px",
                padding: "20px 0",
                borderBottom: idx < items.length - 1 ? "1px solid var(--creme-dark)" : "none",
              }}
            >
              {item.image_url && (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "var(--lavande-pale)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/boutique/${item.slug}`}
                  style={{
                    fontWeight: 500,
                    color: "var(--prune)",
                    textDecoration: "none",
                  }}
                >
                  {item.name}
                </Link>
                {Object.keys(item.custom_fields).length > 0 && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                      lineHeight: 1.5,
                    }}
                  >
                    {Object.entries(item.custom_fields).map(([fid, val]) => (
                      <span key={fid} style={{ display: "block" }}>
                        {fid}: {val}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1, item.custom_fields)
                    }
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "1px solid var(--lavande-light)",
                      borderRadius: "8px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text)",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: "24px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1, item.custom_fields)
                    }
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "1px solid var(--lavande-light)",
                      borderRadius: "8px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text)",
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(item.product_id, item.custom_fields)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--rose)",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginLeft: "8px",
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  color: "var(--prune)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {formatPrice(String(lineTotal))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total + actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "24px",
        }}
      >
        <Link
          href="/boutique"
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "underline",
          }}
        >
          ← Continuer mes achats
        </Link>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "26px",
              color: "var(--prune)",
              marginBottom: "16px",
            }}
          >
            Total : {formatPrice(String(total))}
          </p>
          <Link href="/checkout" className="btn btn--primary" style={{ fontSize: "12px" }}>
            Commander
          </Link>
        </div>
      </div>
    </div>
  );
}
