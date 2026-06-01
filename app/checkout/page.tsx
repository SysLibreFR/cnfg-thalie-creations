"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { createCheckoutSession, getShippingZones } from "@/lib/api";
import type { ShippingZone } from "@/lib/types";

export default function CheckoutPage() {
  const { items, total, loaded } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [error, setError] = useState("");
  const [zones, setZones] = useState<ShippingZone[]>([]);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "FR",
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
        items: items.map((i) => ({
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
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/panier`,
      });

      window.location.href = session.session_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
      setStep("form");
    }
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "28px",
          color: "var(--prune)",
          marginBottom: "32px",
        }}
      >
        Finaliser la commande
      </h1>

      {error && (
        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Identité */}
        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "10px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--sable)",
              marginBottom: "16px",
            }}
          >
            Vos informations
          </legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input
              required
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
            <input
              required
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...inputStyle, marginTop: "12px" }}
          />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ ...inputStyle, marginTop: "12px" }}
          />
        </fieldset>

        {/* Adresse */}
        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "10px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--sable)",
              marginBottom: "16px",
            }}
          >
            Adresse de livraison
          </legend>
          <input
            required
            placeholder="Adresse"
            value={address.line1}
            onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
            style={inputStyle}
          />
          <input
            placeholder="Complément (optionnel)"
            value={address.line2}
            onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
            style={{ ...inputStyle, marginTop: "12px" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "12px" }}>
            <input
              required
              placeholder="Code postal"
              value={address.postal_code}
              onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
              style={inputStyle}
            />
            <input
              required
              placeholder="Ville"
              value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <select
            value={address.country}
            onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
            style={{ ...inputStyle, marginTop: "12px" }}
          >
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

        {/* Mode de livraison */}
        {zones.length > 0 && (
          <fieldset style={{ border: "none", padding: 0 }}>
            <legend
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "10px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--sable)",
                marginBottom: "16px",
              }}
            >
              Mode de livraison
            </legend>
            {zones.map((z) => {
              const isFree = z.free_above && total >= parseFloat(z.free_above);
              return (
                <label
                  key={z.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    border: `1px solid ${selectedZone === z.id ? "var(--prune)" : "var(--creme-dark)"}`,
                    borderRadius: "12px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    background: selectedZone === z.id ? "var(--lavande-pale)" : "#fff",
                    transition: "border-color .2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="radio"
                      name="shipping_zone"
                      checked={selectedZone === z.id}
                      onChange={() => setSelectedZone(z.id)}
                    />
                    <div>
                      <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                        {z.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {z.countries.join(", ")}
                        {z.free_above && ` — gratuit dès ${z.free_above} €`}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 500, fontSize: "14px", color: "var(--prune)" }}>
                    {isFree ? "Gratuit" : `${z.price} €`}
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}

        {/* Notes */}
        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "10px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--sable)",
              marginBottom: "16px",
            }}
          >
            Note pour l&apos;artisane (optionnelle)
          </legend>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Indications spéciales pour la livraison…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </fieldset>

        {/* Récapitulatif */}
        <div
          style={{
            background: "var(--creme)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            <span>{items.length} article(s)</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--prune)",
              borderTop: "1px solid var(--creme-dark)",
              paddingTop: "12px",
            }}
          >
            <span>Total estimé</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Paiement */}
        <button
          type="submit"
          disabled={step === "loading"}
          className="btn btn--primary"
          style={{
            width: "100%",
            padding: "16px 28px",
            fontSize: "13px",
            opacity: step === "loading" ? 0.6 : 1,
            cursor: step === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {step === "loading" ? "Redirection vers Stripe…" : "Payer par carte"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--creme-dark)",
  borderRadius: "10px",
  fontSize: "14px",
  fontFamily: "inherit",
  color: "var(--text)",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};
