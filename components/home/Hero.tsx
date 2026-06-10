import Link from "next/link";
import Image from "next/image";
import type { Artisan } from "@/lib/types";
import { initials } from "@/lib/utils";

interface HeroBlockData {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  coin_url?: string;
}

export default function Hero({
  artisan,
  data,
}: {
  artisan: Artisan;
  data: HeroBlockData;
}) {
  const eyebrow = data.eyebrow ?? "Artisanat fait main";
  const title = data.title ?? artisan.name;
  const subtitle = data.subtitle ?? artisan.description ?? "";
  const caption = data.caption ?? "";
  const mono = initials(artisan.name);
  const coinUrl = data.coin_url;

  return (
    <section className="hero-2col hero-2col--tall" style={{
      position: "relative",
      overflow: "hidden",
    }}>
      {coinUrl && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Image
            src={coinUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-contain"
            style={{ objectPosition: "top right" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top right, var(--lavande-light) 30%, var(--lavande-pale) 50%, transparent 100%)",
            pointerEvents: "none",
          }} />
        </div>
      )}
      {/* Gauche — monogramme ou logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          padding: "56px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {artisan.logo_url ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              maxWidth: "320px",
              border: "3px solid var(--lavande-light)",
              background: "#fff",
            }}
          >
            <Image src={artisan.logo_url} alt={`Logo ${artisan.name}`} fill priority sizes="(max-width: 480px) calc(100vw - 112px), 320px" className="object-contain" />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: mono.length > 2 ? "96px" : "140px", fontWeight: 600, color: "var(--prune)", lineHeight: 1 }}>
              {mono[0]}
            </span>
            {mono[1] && (
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "110px", color: "var(--prune-light)", lineHeight: 1, marginTop: "-16px" }}>
                {mono[1]}
              </span>
            )}
          </div>
        )}
        {caption && (
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "16px" }}>
            {caption}
          </p>
        )}
      </div>

      {/* Droite — texte */}
      <div
        style={{
          padding: "64px 40px 64px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span className="eyebrow-row">{eyebrow}</span>
        <h1
          style={{
            fontSize: "44px",
            color: "var(--prune)",
            lineHeight: 1.2,
            marginBottom: "14px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "18px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "30px",
            }}
          >
            {subtitle}
          </p>
        )}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/boutique" className="btn btn--primary">
            Découvrir la boutique
          </Link>
          <Link href="/a-propos" className="btn btn--outline">
            En savoir plus
          </Link>
        </div>
      </div>
    </section>
  );
}
