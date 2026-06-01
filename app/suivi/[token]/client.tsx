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

export default function ClientTracker({
  order: initial,
  token,
}: {
  order: OrderPublic;
  token: string;
}) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    if (order.status === "delivered" || order.status === "cancelled") return;
    const interval = setInterval(async () => {
      try {
        const updated = await trackOrder(token);
        setOrder(updated);
      } catch {
        /* ignore */
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [order.status, token]);

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 20px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "24px",
          color: "var(--prune)",
          marginBottom: "4px",
        }}
      >
        Suivi de commande
      </h1>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "32px" }}>
        Commande du {new Date(order.created_at).toLocaleDateString("fr-FR")}
      </p>

      {/* Badge statut */}
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "15px",
          marginBottom: "32px",
          background:
            order.status === "cancelled"
              ? "#fef2f2"
              : order.status === "pending_payment"
                ? "#fff7ed"
                : "#f0fdf4",
          color:
            order.status === "cancelled"
              ? "#991b1b"
              : order.status === "pending_payment"
                ? "#9a3412"
                : "#166534",
        }}
      >
        {STATUS_LABELS[order.status] ?? order.status}
      </div>

      {/* Barre de progression */}
      {order.status !== "cancelled" && order.status !== "pending_payment" && (
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            {STATUS_STEPS.map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: i <= currentStep ? "var(--prune)" : "#d1d5db",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <div
            style={{
              height: "6px",
              background: "var(--creme-dark)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "3px",
                background: "var(--prune)",
                transition: "width 0.5s ease",
                width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Articles */}
      <div
        style={{
          borderTop: "1px solid var(--creme-dark)",
          marginBottom: "20px",
        }}
      >
        {order.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--creme-dark)",
            }}
          >
            <div>
              <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                {item.product_snapshot.name}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                x{item.quantity}
              </p>
              {item.customizations &&
                Object.values(item.customizations).map((c, ci) => (
                  <p key={ci} style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {c.label} : {c.label_value ?? String(c.value)}
                  </p>
                ))}
            </div>
            <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--prune)" }}>
              {item.subtotal} €
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: "right",
          fontFamily: "'Playfair Display', serif",
          fontSize: "22px",
          color: "var(--prune)",
        }}
      >
        Total : {order.total} €
      </p>
    </div>
  );
}
