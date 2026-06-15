"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import {
  createCheckoutSession,
  getShippingZones,
  getShippingConfig,
  validateCheckout,
  getArtisanClient,
} from "@/lib/api";
import type { ShippingZone, ShippingConfig, PickupPoint, Artisan } from "@/lib/types";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Échec du chargement de ${src}`));
    document.head.appendChild(s);
  });
}

type ShippingMethod = "home_delivery" | "mondial_relay";

export default function CheckoutPage() {
  console.log("MR: RENDER", Date.now());

  const { items, total, loaded } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [error, setError] = useState("");
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [paymentError, setPaymentError] = useState(false);

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

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home_delivery");
  const [pickupPoint, setPickupPoint] = useState<PickupPoint | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [mrLoaded, setMrLoaded] = useState(false);
  const mrBtnRef = useRef<HTMLDivElement>(null);

  const mrCarrier = config?.carriers.find(
    (c) => c.carrier === "mondial_relay" && c.enabled
  );
  const hasMondialRelay = !!mrCarrier;
  const mrPublicConfig = mrCarrier?.public_config as
    | { enseigne?: string; services?: string[] }
    | undefined;

  useEffect(() => {
    getShippingZones().then(setZones);
    getShippingConfig().then(setConfig);
    getArtisanClient().then(setArtisan);
  }, []);

  const debouncedValidate = useCallback(async () => {
    if (items.length === 0) return;
    try {
      const result = await validateCheckout({
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          custom_fields: i.custom_fields,
        })),
        country: address.country,
        shipping_method: shippingMethod,
      });
      setShippingCost(Number(result.shipping_cost));
    } catch {
      setShippingCost(null);
    }
  }, [items, address.country, shippingMethod]);

  useEffect(() => {
    const timer = setTimeout(debouncedValidate, 400);
    return () => clearTimeout(timer);
  }, [debouncedValidate]);



  if (!loaded) return null;
  if (items.length === 0) {
    router.push("/panier");
    return null;
  }

  async function openMrWidget() {
    if (typeof window === "undefined") return;

    if (!(window as unknown as Record<string, unknown>).jQuery) {
      try {
        await loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js");
      } catch (e) {
        console.error("MR: échec chargement jQuery", e);
        return;
      }
    }

    if (!mrLoaded) {
      try {
        await loadScript(
          "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
        );
        setMrLoaded(true);
      } catch (e) {
        console.error("MR: échec chargement widget", e);
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 500));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const $ = (window as any).jQuery;
    if (!$) {
      console.error("MR: jQuery introuvable");
      return;
    }
    if (typeof $.fn.MR_ParcelShopPicker !== "function") {
      console.error("MR: plugin MR_ParcelShopPicker non trouvé", { fn: Object.keys($.fn).filter(k => k.includes("MR")) });
      return;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;";

    const modal = document.createElement("div");
    modal.style.cssText =
      "width:90%;max-width:800px;height:80vh;background:#fff;border-radius:12px;position:relative;overflow:hidden;display:flex;flex-direction:column;";

    const header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;flex-shrink:0;";

    const title = document.createElement("span");
    title.textContent = "Choisir un point relais";
    title.style.cssText = "font-weight:600;font-size:15px;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText =
      "background:none;border:none;font-size:20px;cursor:pointer;color:#666;line-height:1;padding:4px;";
    closeBtn.onclick = () => overlay.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);

    const container = document.createElement("div");
    container.id = "mr-widget-" + Date.now();
    container.style.cssText = "flex:1;min-height:0;";

    modal.appendChild(header);
    modal.appendChild(container);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    try {
      console.log("MR: initialisation du widget...");
      $("#" + container.id).MR_ParcelShopPicker({
        brand: mrPublicConfig?.enseigne ?? "BDTEST13",
        country: address.country || "FR",
        postCode: address.postal_code,
        service: mrPublicConfig?.services ?? ["24R"],
        Responsive: true,
        ShowResultsOnMap: true,
        OnParcelShopSelected: (parcelshop: Record<string, string>) => {
          console.log("MR: point relais sélectionné", parcelshop);
          setPickupPoint({
            id: parcelshop.ID,
            name: parcelshop.Name,
            address: parcelshop.Address1,
            city: parcelshop.City,
            postal_code: parcelshop.PostCode,
          });
          overlay.remove();
        },
      });
      console.log("MR: widget initialisé");
    } catch (e) {
      console.error("MR: erreur initialisation", e);
      overlay.remove();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    setError("");

    if (shippingMethod === "mondial_relay" && !pickupPoint) {
      setError("Veuillez sélectionner un point relais");
      setStep("form");
      return;
    }

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
        shipping_zone_id:
          shippingMethod === "home_delivery" ? selectedZone || undefined : undefined,
        shipping_method: shippingMethod,
        pickup_point_id:
          shippingMethod === "mondial_relay" ? pickupPoint?.id : undefined,
        notes: notes || undefined,
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/panier`,
      });

      window.location.href = session.session_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isPaymentNotActive =
        msg.includes("paiements en ligne") ||
        msg.includes("stripe_onboarding") ||
        msg.includes("Stripe Connect");
      if (isPaymentNotActive) {
        setPaymentError(true);
        setError(
          "Le paiement par carte n'est pas encore disponible pour cette boutique. " +
          "Contactez l'artisane pour finaliser votre commande."
        );
      } else {
        setError(msg || "Erreur lors du paiement");
      }
      setStep("form");
    }
  }

  const estimatedTotal =
    shippingCost != null ? total + shippingCost : total;

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
            padding: "20px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: 0 }}>{error}</p>
          {paymentError && artisan?.contact?.email && (
            <a
              href={`mailto:${artisan.contact.email}?subject=${encodeURIComponent(
                "Demande de commande — paiement par carte indisponible"
              )}&body=${encodeURIComponent(
                `Bonjour,\n\n` +
                `Je souhaite passer une commande mais le paiement par carte n'est pas encore disponible.\n\n` +
                `Voici le récapitulatif de mon panier :\n` +
                items
                  .map(
                    (i) =>
                      `- ${i.name} x${i.quantity} = ${(i.price * i.quantity).toFixed(2)} €`
                  )
                  .join("\n") +
                `\n\nTotal : ${total.toFixed(2)} €` +
                `\n\nAdresse de livraison :\n${address.line1}${address.line2 ? `\n${address.line2}` : ""}\n${address.postal_code} ${address.city}\n\n` +
                `Merci de me contacter pour finaliser cette commande.\n\nCordialement,\n${firstName} ${lastName}`
              )}`}
              className="btn btn--outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "16px",
                padding: "10px 20px",
                fontSize: "12px",
                color: "#991b1b",
                borderColor: "#fecaca",
                background: "#fff",
                textDecoration: "none",
                borderRadius: "10px",
                fontWeight: 500,
              }}
            >
              Contacter l&apos;artisane
            </a>
          )}
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

        {/* Transporteur */}
        {hasMondialRelay && (
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
              Transporteur
            </legend>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                border: `1px solid ${shippingMethod === "home_delivery" ? "var(--prune)" : "var(--creme-dark)"}`,
                borderRadius: "12px",
                marginBottom: "8px",
                cursor: "pointer",
                background: shippingMethod === "home_delivery" ? "var(--lavande-pale)" : "#fff",
                transition: "border-color .2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="radio"
                  name="shipping_method"
                  checked={shippingMethod === "home_delivery"}
                  onChange={() => {
                    setShippingMethod("home_delivery");
                    setPickupPoint(null);
                  }}
                />
                <div>
                  <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                    Livraison à domicile
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Colissimo, Lettre suivie
                  </p>
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                border: `1px solid ${shippingMethod === "mondial_relay" ? "var(--prune)" : "var(--creme-dark)"}`,
                borderRadius: "12px",
                marginBottom: "8px",
                cursor: "pointer",
                background: shippingMethod === "mondial_relay" ? "var(--lavande-pale)" : "#fff",
                transition: "border-color .2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="radio"
                  name="shipping_method"
                  checked={shippingMethod === "mondial_relay"}
                  onChange={() => {
                    setShippingMethod("mondial_relay");
                    setTimeout(() => {
                      console.log("MR: ouverture auto");
                      openMrWidget();
                    }, 300);
                  }}
                />
                <div>
                  <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                    Point relais
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Mondial Relay
                  </p>
                </div>
              </div>
            </label>
          </fieldset>
        )}

        {/* Mode de livraison — zones */}
        {shippingMethod === "home_delivery" && zones.length > 0 && (
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
              Zone de livraison
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

        {/* Point relais — sélection */}
        {shippingMethod === "mondial_relay" && (
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
              Point relais
            </legend>

            {pickupPoint ? (
              <div
                style={{
                  padding: "14px 16px",
                  border: "1px solid var(--prune)",
                  borderRadius: "12px",
                  background: "var(--lavande-pale)",
                }}
              >
                <p style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                  {pickupPoint.name}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {pickupPoint.address}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {pickupPoint.postal_code} {pickupPoint.city}
                </p>
                <button
                  type="button"
                  onClick={() => setPickupPoint(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--prune)",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    textDecoration: "underline",
                  }}
                >
                  Modifier le point relais
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Sélectionnez un point relais Mondial Relay pour la livraison.
                </p>
                <div
                  ref={mrBtnRef}
                  onClick={() => {
                    console.log("MR: clic");
                    openMrWidget();
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "1px solid var(--creme-dark)",
                    borderRadius: "12px",
                    background: "var(--creme)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "var(--text)",
                    fontFamily: "inherit",
                    transition: "background .2s",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  Choisir un point relais
                </div>
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Ou saisir manuellement l&apos;identifiant du point relais (5-6 chiffres)&nbsp;:
                  </p>
                  <input
                    placeholder="Exemple : 034976"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (/^\d{5,6}$/.test(v)) {
                        setPickupPoint({
                          id: v,
                          name: `Point relais n°${v}`,
                          address: "",
                          city: address.city || "",
                          postal_code: address.postal_code || "",
                        });
                      }
                    }}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
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
              marginBottom: "8px",
            }}
          >
            <span>{items.length} article(s)</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          {shippingCost != null && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              <span>Frais de port</span>
              <span>{shippingCost.toFixed(2)} €</span>
            </div>
          )}
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
            <span>{estimatedTotal.toFixed(2)} €</span>
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
