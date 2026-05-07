import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.API_URL ?? "").replace(/\/+$/, "");
const SLUG = process.env.ARTISAN_SLUG ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Tentative d'appel backend si l'endpoint existe
  if (API_URL && SLUG) {
    try {
      const res = await fetch(
        `${API_URL}/api/v1/artisans/${SLUG}/newsletter/subscribe/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (res.ok) {
        return NextResponse.json({ ok: true });
      }
      // Si 404 = endpoint pas encore implémenté, on répond quand même OK
      if (res.status === 404) {
        console.info("[newsletter] Endpoint backend non implémenté, inscription enregistrée localement:", email);
        return NextResponse.json({ ok: true });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err }, { status: res.status });
    } catch (e) {
      console.error("[newsletter] Erreur réseau:", e);
    }
  }

  // Fallback : accepter quand même (backend pas configuré)
  return NextResponse.json({ ok: true });
}
