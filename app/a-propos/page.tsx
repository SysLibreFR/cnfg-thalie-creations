import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getArtisan, getPage, getEditorialBlocks } from "@/lib/api";
import { blockData, hasBlock } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { BlockTimelineItem, BlockStatItem, BlockAtelierCell, BlockCreationItem, BlockValueItem } from "@/lib/types";
import NewsletterSection from "@/components/home/NewsletterSection";

export const metadata: Metadata = { title: "À propos" };
export const revalidate = 3600;

/* Styles partagés entre les tiles */
const TILE: CSSProperties = {
  background: "#fff",
  borderRadius: "22px",
  padding: "36px 32px",
  boxShadow: "6px 6px 0 rgba(155,139,196,0.28)",
};

export default async function AboutPage() {
  const [artisan, aboutPage, blocks] = await Promise.all([
    getArtisan(),
    getPage("a-propos"),
    getEditorialBlocks(),
  ]);

  const theme = artisan?.theme_config ?? {};
  const artisanRole = (theme.artisan_role as string | undefined) ?? "Créatrice & artisane";

  const aboutHeroData     = blockData(blocks, "about_hero");
  const aboutUniverseData = blockData(blocks, "about_universe");
  const timelineData      = blockData(blocks, "timeline");
  const valuesData        = blockData(blocks, "values");
  const atelierData       = blockData(blocks, "atelier");
  const statsData         = blockData(blocks, "stats");
  const creationsData     = blockData(blocks, "creations");
  const newsletterData    = blockData(blocks, "newsletter");
  const aboutCtaData      = blockData(blocks, "about_cta");

  const timelineItems  = (timelineData.items as BlockTimelineItem[] | undefined) ?? [];
  const statsItems     = (statsData.items as BlockStatItem[] | undefined) ?? [];
  const atelierTags    = (atelierData.tags as string[] | undefined) ?? [];
  const atelierCells   = (atelierData.cells as BlockAtelierCell[] | undefined) ??
    [{ icon: "🧶" }, { icon: "✂️" }, { icon: "🪡" }, { icon: "🌸" }];
  const creationItems  = (creationsData.items as BlockCreationItem[] | undefined) ?? [];
  const valuesItems    = (valuesData.items as BlockValueItem[] | undefined) ?? [];

  const eyebrow       = (aboutHeroData.eyebrow as string | undefined) ?? "Mon histoire";
  const heroTitle     = (aboutHeroData.title as string | undefined) ??
    (artisan?.name ? `Bonjour,\nje suis ${artisan.name.split(" ")[0]} !` : "Bonjour !");
  const photoUrl      = (aboutHeroData.photo_url as string | undefined) ?? artisan?.logo_url;
  const coinUrl       = aboutHeroData.coin_url as string | undefined;
  const signatureName = (aboutHeroData.signature_name as string | undefined) ?? artisan?.name?.split(" ")[0];
  const signatureRole = (aboutHeroData.signature_role as string | undefined) ?? artisanRole;
  const universeText  = aboutUniverseData.text as string | undefined;
  const farewellLine1 = aboutCtaData.farewell_line1 as string | undefined;
  const farewellLine2 = aboutCtaData.farewell_line2 as string | undefined;

  const showValuesTile    = valuesItems.length > 0 || !!(valuesData.title as string | undefined);
  const showCreationsTile = creationItems.length > 0;

  return (
    /* Fond lavande-pale unifié sur toute la page */
    <div style={{ background: "var(--lavande-pale)", overflowX: "hidden" }}>

      {/* ── Hero ── */}
      <section className="hero-2col" style={{
        minHeight: "460px",
        position: "relative",
        overflow: "hidden",
        ...(coinUrl
          ? {
              background: `linear-gradient(to top right, var(--lavande-pale) 35%, transparent 100%), url(${coinUrl}) center / cover no-repeat`,
            }
          : { background: "transparent" }),
      }}>

        {/* Colonne photo */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          padding: "40px 72px 48px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Éléments décoratifs */}
          <span style={{ position: "absolute", top: "18px", left: "18px", fontSize: "26px", opacity: 0.35, transform: "rotate(-30deg)", pointerEvents: "none" }}>🌿</span>
          <span style={{ position: "absolute", bottom: "28px", right: "14px", fontSize: "26px", opacity: 0.35, transform: "rotate(40deg)", pointerEvents: "none" }}>🌸</span>
          <span style={{ position: "absolute", top: "30px", right: "30px", fontSize: "15px", color: "var(--rose)", opacity: 0.6, pointerEvents: "none" }}>♥</span>
          <span style={{ position: "absolute", bottom: "70px", left: "18px", fontSize: "15px", color: "var(--rose)", opacity: 0.6, pointerEvents: "none" }}>♥</span>

          {/* Cadre photo — large, légèrement penché */}
          <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            border: "5px solid rgba(255,255,255,0.85)",
            overflow: "hidden",
            transform: "rotate(-2deg)",
            boxShadow: "10px 10px 0 rgba(155,139,196,0.35)",
            flexShrink: 0,
          }}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={artisan?.name ?? "Portrait"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={aboutHeroData.photo_url ? "object-cover" : "object-contain"}
                style={{ background: "#fff" }}
              />
            ) : (
              <span style={{ fontSize: "80px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff" }}>🧶</span>
            )}
          </div>

          {/* Badge rôle */}
          <span style={{
            background: "var(--prune)",
            color: "#fff",
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "9px",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            padding: "7px 22px",
            borderRadius: "30px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {signatureRole}
          </span>
        </div>

        {/* Colonne texte */}
        <div style={{ padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="eyebrow-row">{eyebrow}</span>
          <h1 style={{ fontSize: "48px", color: "var(--prune)", lineHeight: 1.15, marginBottom: "20px", whiteSpace: "pre-line" }}>
            {heroTitle}
          </h1>
          {((aboutHeroData.subtitle as string | undefined) ?? aboutPage?.excerpt ?? artisan?.description) && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "var(--text)", lineHeight: 1.8, marginBottom: "28px" }}>
              {(aboutHeroData.subtitle as string | undefined) ?? aboutPage?.excerpt ?? artisan?.description}
            </p>
          )}
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "38px", color: "var(--prune)" }}>
            {signatureName ?? ""}
          </p>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "4px" }}>
            {signatureRole}
          </p>
        </div>
      </section>

      {/* ── Mon univers — pavé blanc penché ── */}
      {universeText && (
        <div style={{ padding: "48px 40px 40px", display: "flex", justifyContent: "center" }}>
          <div style={{ ...TILE, maxWidth: "580px", width: "100%", transform: "rotate(-1.4deg)", padding: "36px 52px" }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "19px",
              color: "var(--prune)",
              lineHeight: 1.75,
              textAlign: "center",
              transform: "rotate(1.4deg)",
            }}>
              {universeText}
            </p>
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      {timelineItems.length > 0 && (
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            {(timelineData.eyebrow as string | undefined) && (
              <span className="section__eyebrow">{timelineData.eyebrow as string}</span>
            )}
            {(timelineData.title as string | undefined) && (
              <h2 className="section__title">{timelineData.title as string}</h2>
            )}
            <div className="section__line" />
          </div>
          <div style={{ position: "relative", maxWidth: "660px", margin: "0 auto" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1.5px", background: "rgba(155,139,196,0.5)", transform: "translateX(-50%)" }} />
            {timelineItems.map((item, i) => {
              const isLeft = i % 2 === 0;
              const content = (
                <>
                  <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sable)", marginBottom: "5px" }}>{item.year}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 500, color: "var(--prune)", marginBottom: "7px" }}>{item.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.7 }}>{item.text}</p>
                </>
              );
              return (
                <div key={i} className="timeline-row">
                  <div className={`timeline-content--l${!isLeft ? " timeline-content--hidden" : ""}`}>{content}</div>
                  <div className="timeline-dot-wrapper" style={{ display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--prune)", border: "3px solid var(--lavande-pale)", boxShadow: "0 0 0 2px var(--lavande)", flexShrink: 0 }} />
                  </div>
                  <div className={`timeline-content--r${isLeft ? " timeline-content--hidden" : ""}`}>{content}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Valeurs + Créations côte à côte ── */}
      {(showValuesTile || showCreationsTile) && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="tiles-2col">

            {/* Pavé Valeurs — penché à gauche */}
            {showValuesTile && (
              <div style={{ ...TILE, transform: "rotate(-1.3deg)" }}>
                {/* En-tête */}
                <div style={{ textAlign: "center", marginBottom: "24px", transform: "rotate(1.3deg)" }}>
                  {(valuesData.eyebrow as string | undefined) && (
                    <span className="section__eyebrow">{valuesData.eyebrow as string}</span>
                  )}
                  {(valuesData.title as string | undefined) && (
                    <h2 className="section__title" style={{ fontSize: "24px" }}>{valuesData.title as string}</h2>
                  )}
                  <div className="section__line" />
                </div>
                {/* Items */}
                {valuesItems.length > 0 && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: valuesItems.length > 2 ? "1fr 1fr" : "1fr",
                    gap: "12px",
                    transform: "rotate(1.3deg)",
                  }}>
                    {valuesItems.map((v, i) => (
                      <div key={i} style={{
                        textAlign: "center",
                        padding: "20px 12px",
                        borderRadius: "14px",
                        background: "var(--lavande-pale)",
                      }}>
                        <span style={{ fontSize: "26px", marginBottom: "10px", display: "block" }}>{v.icon}</span>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 500, color: "var(--prune)", marginBottom: "6px" }}>{v.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--text)", lineHeight: 1.6 }}>{v.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pavé Créations — penché à droite */}
            {showCreationsTile && (
              <div style={{ ...TILE, transform: "rotate(0.9deg)" }}>
                {/* En-tête */}
                <div style={{ textAlign: "center", marginBottom: "24px", transform: "rotate(-0.9deg)" }}>
                  {(creationsData.eyebrow as string | undefined) && (
                    <span className="section__eyebrow">{creationsData.eyebrow as string}</span>
                  )}
                  {(creationsData.title as string | undefined) && (
                    <h2 className="section__title" style={{ fontSize: "24px" }}>{creationsData.title as string}</h2>
                  )}
                  <div className="section__line" />
                </div>
                {/* Items — pas de rotation individuelle */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", transform: "rotate(-0.9deg)" }}>
                  {creationItems.map((item, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "9px 14px",
                      borderRadius: "10px",
                      background: i % 2 === 0 ? "var(--lavande-pale)" : "transparent",
                    }}>
                      <span style={{ fontSize: "19px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "var(--prune)", lineHeight: 1.3 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Atelier ── */}
      {hasBlock(blocks, "atelier") && (
        <div className="section">
          <div className="atelier-grid">
            <div className="atelier-visual" style={{ background: "#fff", borderRadius: "20px", height: "300px", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "14px", padding: "24px", boxShadow: "6px 6px 0 rgba(155,139,196,0.2)" }}>
              {atelierCells.map((cell, i) => (
                <div key={i} style={{ background: "var(--lavande-pale)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}>
                  {cell.icon}
                </div>
              ))}
            </div>
            <div>
              {(atelierData.eyebrow as string | undefined) && (
                <span className="eyebrow-row eyebrow-row--sable">{atelierData.eyebrow as string}</span>
              )}
              <h2 style={{ fontSize: "28px", color: "var(--prune)", marginBottom: "16px", lineHeight: 1.3 }}>
                {(atelierData.title as string | undefined) ?? "Dans mon atelier"}
              </h2>
              {(atelierData.text1 as string | undefined) && (
                <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.85, marginBottom: "14px" }}>{atelierData.text1 as string}</p>
              )}
              {(atelierData.text2 as string | undefined) && (
                <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.85, marginBottom: "14px" }}>{atelierData.text2 as string}</p>
              )}
              {atelierTags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                  {atelierTags.map((tag, i) => (
                    <span key={i} style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", background: "#fff", color: "var(--prune)", padding: "7px 16px", borderRadius: "30px", border: "1px solid var(--lavande-light)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Statistiques (section prune pleine largeur) ── */}
      {statsItems.length > 0 && (
        <section className="section section--prune">
          <div className="section__header">
            {(statsData.eyebrow as string | undefined) && (
              <span className="section__eyebrow section__eyebrow--white">{statsData.eyebrow as string}</span>
            )}
            {(statsData.title as string | undefined) && (
              <h2 className="section__title section__title--white">{statsData.title as string}</h2>
            )}
            <div className="section__line section__line--white" />
          </div>
          <div className="cards-grid-4" style={{ gridTemplateColumns: `repeat(${statsItems.length}, 1fr)` }}>
            {statsItems.map((stat, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px", borderRight: i < statsItems.length - 1 ? "1px solid rgba(255,255,255,.15)" : "none" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", color: "#fff", display: "block", marginBottom: "6px" }}>{stat.number}</span>
                <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "9px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.65)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA + phrase de clôture ── */}
      <div className="section" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "30px", color: "var(--prune)", marginBottom: "12px" }}>
          {(aboutCtaData.title as string | undefined) ?? "Envie d'une création unique ?"}
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "17px", color: "var(--text)", marginBottom: "28px", maxWidth: "560px", margin: "0 auto 28px" }}>
          {(aboutCtaData.text as string | undefined) ?? "Chaque commande est une belle aventure. Je serais ravie de créer quelque chose rien que pour vous."}
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/boutique" className="btn btn--primary">Découvrir la boutique</Link>
          {artisan?.contact?.email && (
            <a href={`mailto:${artisan.contact.email}`} className="btn btn--outline">Me contacter</a>
          )}
        </div>

        {/* Pavé de clôture — penché positif */}
        {(farewellLine1 || farewellLine2) && (
          <div style={{ marginTop: "52px" }}>
            <div style={{ ...TILE, display: "inline-block", padding: "24px 44px", transform: "rotate(1.3deg)" }}>
              {farewellLine1 && (
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "20px",
                  color: "var(--prune)",
                  marginBottom: farewellLine2 ? "6px" : 0,
                  transform: "rotate(-1.3deg)",
                }}>
                  {farewellLine1}
                </p>
              )}
              {farewellLine2 && (
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  transform: "rotate(-1.3deg)",
                }}>
                  {farewellLine2}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Newsletter (section prune pleine largeur) ── */}
      {hasBlock(blocks, "newsletter") && (
        <NewsletterSection
          title={newsletterData.title as string | undefined}
          subtitle={newsletterData.subtitle as string | undefined}
        />
      )}
    </div>
  );
}
