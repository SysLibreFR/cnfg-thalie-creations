import type { Metadata } from "next";
import { getArtisan, getPage, getEditorialBlocks } from "@/lib/api";
import { blockData, hasBlock } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { BlockTimelineItem, BlockStatItem, BlockAtelierCell, BlockCreationItem } from "@/lib/types";
import NewsletterSection from "@/components/home/NewsletterSection";
import ValuesSection from "@/components/home/ValuesSection";

export const metadata: Metadata = { title: "À propos" };
export const revalidate = 3600;

const CREATION_TILTS = ["-0.8deg", "0.7deg", "-0.5deg", "0.9deg", "-0.7deg", "0.5deg", "-1deg", "0.6deg"];

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

  const eyebrow       = (aboutHeroData.eyebrow as string | undefined) ?? "Mon histoire";
  const heroTitle     = (aboutHeroData.title as string | undefined) ??
    (artisan?.name ? `Bonjour,\nje suis ${artisan.name.split(" ")[0]} !` : "Bonjour !");
  const photoUrl      = (aboutHeroData.photo_url as string | undefined) ?? artisan?.logo_url;
  const signatureName = (aboutHeroData.signature_name as string | undefined) ?? artisan?.name?.split(" ")[0];
  const signatureRole = (aboutHeroData.signature_role as string | undefined) ?? artisanRole;
  const universeText  = aboutUniverseData.text as string | undefined;
  const farewellLine1 = aboutCtaData.farewell_line1 as string | undefined;
  const farewellLine2 = aboutCtaData.farewell_line2 as string | undefined;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-2col hero-2col--medium">
        {/* Colonne visuelle */}
        <div style={{
          background: "var(--lavande-pale)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}>
          <span style={{ position: "absolute", top: "20px", left: "20px", fontSize: "28px", opacity: 0.4, transform: "rotate(-30deg)" }}>🌿</span>
          <span style={{ position: "absolute", bottom: "30px", right: "16px", fontSize: "28px", opacity: 0.4, transform: "rotate(40deg)" }}>🌸</span>
          <span style={{ position: "absolute", top: "32px", right: "32px", fontSize: "16px", color: "var(--rose)" }}>♥</span>
          <span style={{ position: "absolute", bottom: "52px", left: "20px", fontSize: "16px", color: "var(--rose)" }}>♥</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%", maxWidth: "280px" }}>
            {/* Photo / logo encadré, légèrement penché */}
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              border: "3px solid var(--lavande-light)",
              background: "#fff",
              transform: "rotate(-2deg)",
              boxShadow: "5px 5px 0 var(--lavande-light)",
              overflow: "hidden",
            }}>
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={artisan?.name ?? "Portrait"}
                  fill
                  className={aboutHeroData.photo_url ? "object-cover" : "object-contain"}
                />
              ) : (
                <span style={{ fontSize: "72px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🧶</span>
              )}
            </div>
            <span style={{
              background: "var(--prune)",
              color: "#fff",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "9px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              padding: "6px 18px",
              borderRadius: "30px",
              whiteSpace: "nowrap",
            }}>
              {signatureRole}
            </span>
          </div>
        </div>

        {/* Colonne texte */}
        <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="eyebrow-row">{eyebrow}</span>
          <h1 style={{ fontSize: "36px", color: "var(--prune)", lineHeight: 1.2, marginBottom: "16px", whiteSpace: "pre-line" }}>
            {heroTitle}
          </h1>
          {((aboutHeroData.subtitle as string | undefined) ?? aboutPage?.excerpt ?? artisan?.description) && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "17px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "22px" }}>
              {(aboutHeroData.subtitle as string | undefined) ?? aboutPage?.excerpt ?? artisan?.description}
            </p>
          )}
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "30px", color: "var(--prune)" }}>
            {signatureName ?? ""}
          </p>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "9px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sable)", marginTop: "3px" }}>
            {signatureRole}
          </p>
        </div>
      </section>

      {/* ── Mon univers — pavé penché ── */}
      {universeText && (
        <section className="section section--white" style={{ display: "flex", justifyContent: "center" }}>
          {/* Pavé penché négatif, contre-rotation du texte pour lisibilité */}
          <div style={{
            maxWidth: "580px",
            width: "100%",
            background: "var(--lavande-pale)",
            borderRadius: "22px",
            padding: "36px 52px",
            transform: "rotate(-1.4deg)",
            boxShadow: "5px 6px 0 var(--lavande-light)",
          }}>
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
        </section>
      )}

      {/* ── Timeline ── */}
      {timelineItems.length > 0 && (
        <section className="section section--creme">
          <div className="section__header">
            {(timelineData.eyebrow as string | undefined) && (
              <span className="section__eyebrow">{timelineData.eyebrow as string}</span>
            )}
            {(timelineData.title as string | undefined) && (
              <h2 className="section__title">{timelineData.title as string}</h2>
            )}
            <div className="section__line" />
          </div>
          <div style={{ position: "relative", maxWidth: "660px", margin: "0 auto" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1.5px", background: "var(--lavande-light)", transform: "translateX(-50%)" }} />
            {timelineItems.map((item, i) => {
              const isLeft = i % 2 === 0;
              const content = (
                <>
                  <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sable)", marginBottom: "5px" }}>{item.year}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 500, color: "var(--prune)", marginBottom: "7px" }}>{item.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7 }}>{item.text}</p>
                </>
              );
              return (
                <div key={i} className="timeline-row">
                  <div className={`timeline-content--l${!isLeft ? " timeline-content--hidden" : ""}`}>
                    {content}
                  </div>
                  <div className="timeline-dot-wrapper" style={{ display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--prune)", border: "3px solid #fff", boxShadow: "0 0 0 2px var(--lavande-light)", flexShrink: 0 }} />
                  </div>
                  <div className={`timeline-content--r${isLeft ? " timeline-content--hidden" : ""}`}>
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Valeurs ── */}
      <ValuesSection data={valuesData} />

      {/* ── Atelier ── */}
      {hasBlock(blocks, "atelier") && (
        <section className="section section--creme">
          <div className="atelier-grid">
            <div className="atelier-visual" style={{ background: "var(--lavande-pale)", borderRadius: "20px", height: "300px", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "14px", padding: "24px" }}>
              {atelierCells.map((cell, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}>
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
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "14px" }}>{atelierData.text1 as string}</p>
              )}
              {(atelierData.text2 as string | undefined) && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "14px" }}>{atelierData.text2 as string}</p>
              )}
              {atelierTags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                  {atelierTags.map((tag, i) => (
                    <span key={i} style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", background: "var(--lavande-pale)", color: "var(--prune)", padding: "7px 16px", borderRadius: "30px", border: "1px solid var(--lavande-light)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Statistiques ── */}
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
                <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "9px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.55)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Créations — grille de pavés penchés ── */}
      {creationItems.length > 0 && (
        <section className="section section--white">
          <div className="section__header">
            {(creationsData.eyebrow as string | undefined) && (
              <span className="section__eyebrow">{creationsData.eyebrow as string}</span>
            )}
            {(creationsData.title as string | undefined) && (
              <h2 className="section__title">{creationsData.title as string}</h2>
            )}
            <div className="section__line" />
          </div>
          <div className="creations-grid">
            {creationItems.map((item, i) => (
              <div
                key={i}
                style={{
                  background: i % 4 < 2 ? "var(--lavande-pale)" : "#fff",
                  border: "1px solid var(--lavande-light)",
                  borderRadius: "14px",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  transform: `rotate(${CREATION_TILTS[i % CREATION_TILTS.length]})`,
                  boxShadow: "2px 3px 0 var(--lavande-light)",
                }}
              >
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "var(--prune)", lineHeight: 1.3 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA + phrase de clôture ── */}
      <section className="section section--creme" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "30px", color: "var(--prune)", marginBottom: "12px" }}>
          {(aboutCtaData.title as string | undefined) ?? "Envie d'une création unique ?"}
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "17px", color: "var(--text-muted)", marginBottom: "28px", maxWidth: "560px", margin: "0 auto 28px" }}>
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
            <div style={{
              display: "inline-block",
              background: "#fff",
              borderRadius: "18px",
              padding: "24px 44px",
              transform: "rotate(1.3deg)",
              boxShadow: "4px 4px 0 var(--lavande-light)",
            }}>
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
      </section>

      {/* ── Newsletter ── */}
      {hasBlock(blocks, "newsletter") && (
        <NewsletterSection
          title={newsletterData.title as string | undefined}
          subtitle={newsletterData.subtitle as string | undefined}
        />
      )}
    </>
  );
}
