import type { Metadata } from "next";
import { getArtisan, getPage } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import type { TimelineItem, StatItem, ValueItem } from "@/lib/types";

export const metadata: Metadata = { title: "À propos" };
export const revalidate = 3600;

const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "Enfance", title: "La passion naît", text: "Une transmission familiale qui a tout déclenché." },
  { year: "Les débuts", title: "Les premières créations", text: "Des soirées entières à créer, encourager, affiner." },
  { year: "Aujourd’hui", title: artisan_name_placeholder(), text: "Un atelier à temps plein, des centaines de créations." },
];

function artisan_name_placeholder() {
  return "L’atelier";
}

export default async function AboutPage() {
  const [artisan, aboutPage] = await Promise.all([
    getArtisan(),
    getPage("a-propos"),
  ]);

  const theme = artisan?.theme_config ?? {};
  const timeline: TimelineItem[] = theme.timeline?.length
    ? (theme.timeline as TimelineItem[])
    : DEFAULT_TIMELINE;
  const stats: StatItem[] = theme.stats?.length
    ? (theme.stats as StatItem[])
    : [];
  const values: ValueItem[] = theme.values?.length
    ? (theme.values as ValueItem[])
    : [];
  const atelier_tags: string[] = theme.atelier_tags?.length
    ? (theme.atelier_tags as string[])
    : [];
  const atelier_cells = (theme.atelier_cells as { icon: string }[] | undefined) ?? [
    { icon: "🧶" },
    { icon: "✂️" },
    { icon: "🪡" },
    { icon: "🌸" },
  ];

  const artisanRole = theme.artisan_role ?? "Créatrice & artisane";
  const aboutEyebrow = theme.about_eyebrow ?? "Mon histoire";

  return (
    <>
      {/* Hero */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "#fff",
          minHeight: "340px",
        }}
      >
        {/* Visuel */}
        <div
          style={{
            background: "var(--lavande-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span style={{ position: "absolute", top: "20px", left: "20px", fontSize: "28px", opacity: 0.4, transform: "rotate(-30deg)" }}>🌿</span>
          <span style={{ position: "absolute", bottom: "30px", right: "16px", fontSize: "28px", opacity: 0.4, transform: "rotate(40deg)" }}>🌸</span>
          <span style={{ position: "absolute", top: "32px", right: "32px", fontSize: "16px", color: "var(--rose)" }}>♥</span>
          <span style={{ position: "absolute", bottom: "52px", left: "20px", fontSize: "16px", color: "var(--rose)" }}>♥</span>

          <div
            style={{
              width: "220px",
              height: "260px",
              borderRadius: "120px 120px 80px 80px",
              background: "#fff",
              border: "3px solid var(--lavande-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 8px 40px rgba(155,139,196,.2)",
              overflow: "hidden",
            }}
          >
            {artisan?.logo_url ? (
              <Image
                src={artisan.logo_url}
                alt={artisan.name}
                fill
                className="object-cover"
              />
            ) : (
              <span style={{ fontSize: "72px" }}>🧶</span>
            )}
            <span
              style={{
                position: "absolute",
                bottom: "-14px",
                background: "var(--prune)",
                color: "#fff",
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                padding: "6px 18px",
                borderRadius: "30px",
              }}
            >
              {artisanRole}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div
          style={{
            padding: "56px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <span className="eyebrow-row">{aboutEyebrow}</span>
          <h1
            style={{
              fontSize: "36px",
              color: "var(--prune)",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            {artisan?.name
              ? `Bonjour,\nje suis ${artisan.name.split(" ")[0]} !`
              : "Bonjour !"}
          </h1>
          {aboutPage?.excerpt || artisan?.description ? (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "17px",
                color: "var(--text-muted)",
                lineHeight: 1.8,
                marginBottom: "22px",
              }}
            >
              {aboutPage?.excerpt ?? artisan?.description}
            </p>
          ) : null}
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "30px",
              color: "var(--prune)",
            }}
          >
            {artisan?.name?.split(" ")[0] ?? ""}
          </p>
          <p
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "9px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--sable)",
              marginTop: "3px",
            }}
          >
            {artisanRole}
          </p>
        </div>
      </section>

      {/* Contenu narratif de la page CMS */}
      {aboutPage?.content && (
        <section className="section section--white">
          <div
            className="prose-content"
            style={{ maxWidth: "720px", margin: "0 auto" }}
            dangerouslySetInnerHTML={{ __html: aboutPage.content }}
          />
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="section section--creme">
          <div className="section__header">
            <span className="section__eyebrow">Le parcours</span>
            <h2 className="section__title">D’une passion à une vocation</h2>
            <div className="section__line" />
          </div>
          <div
            style={{
              position: "relative",
              maxWidth: "660px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "1.5px",
                background: "var(--lavande-light)",
                transform: "translateX(-50%)",
              }}
            />
            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 48px 1fr",
                    alignItems: "start",
                    marginBottom: "40px",
                  }}
                >
                  <div
                    style={{
                      paddingRight: "30px",
                      textAlign: "right",
                      visibility: isLeft ? "visible" : "hidden",
                    }}
                  >
                    <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sable)", marginBottom: "5px" }}>{item.year}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 500, color: "var(--prune)", marginBottom: "7px" }}>{item.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: "var(--prune)",
                        border: "3px solid #fff",
                        boxShadow: "0 0 0 2px var(--lavande-light)",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      paddingLeft: "30px",
                      visibility: isLeft ? "hidden" : "visible",
                    }}
                  >
                    <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sable)", marginBottom: "5px" }}>{item.year}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 500, color: "var(--prune)", marginBottom: "7px" }}>{item.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Valeurs */}
      {values.length > 0 && (
        <section className="section section--white">
          <div className="section__header">
            <span className="section__eyebrow">Ce qui me guide</span>
            <h2 className="section__title">Mes valeurs</h2>
            <div className="section__line" />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(values.length, 3)}, 1fr)`,
              gap: "22px",
            }}
          >
            {values.map((v, i) => (
              <div
                key={i}
                style={{
                  background: "var(--creme)",
                  borderRadius: "16px",
                  padding: "32px 24px",
                  textAlign: "center",
                  border: "1px solid var(--creme-dark)",
                }}
              >
                <span style={{ fontSize: "32px", marginBottom: "14px", display: "block" }}>{v.icon}</span>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 500, color: "var(--prune)", marginBottom: "10px" }}>{v.title}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Atelier */}
      {(theme.atelier_title || theme.atelier_text1) && (
        <section className="section section--creme">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "56px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "var(--lavande-pale)",
                borderRadius: "20px",
                height: "300px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "14px",
                padding: "24px",
              }}
            >
              {atelier_cells.map((cell, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "34px",
                  }}
                >
                  {cell.icon}
                </div>
              ))}
            </div>
            <div>
              <span className="eyebrow-row eyebrow-row--sable">Coulisses</span>
              <h2 style={{ fontSize: "28px", color: "var(--prune)", marginBottom: "16px", lineHeight: 1.3 }}>
                {theme.atelier_title ?? "Dans mon atelier"}
              </h2>
              {theme.atelier_text1 && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "14px" }}>
                  {theme.atelier_text1 as string}
                </p>
              )}
              {theme.atelier_text2 && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "14px" }}>
                  {theme.atelier_text2 as string}
                </p>
              )}
              {atelier_tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                  {atelier_tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "9px",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        background: "var(--lavande-pale)",
                        color: "var(--prune)",
                        padding: "7px 16px",
                        borderRadius: "30px",
                        border: "1px solid var(--lavande-light)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Chiffres */}
      {stats.length > 0 && (
        <section className="section section--prune">
          <div className="section__header">
            <span className="section__eyebrow section__eyebrow--white">
              {theme.stats_eyebrow ?? "En quelques chiffres"}
            </span>
            <h2 className="section__title section__title--white">
              {theme.stats_title ?? `${artisan?.name ?? ""}, c’est…`}
            </h2>
            <div className="section__line section__line--white" />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "20px",
                  borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,.15)" : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "42px",
                    color: "#fff",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {stat.number}
                </span>
                <span
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "9px",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.55)",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section section--white" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "30px", color: "var(--prune)", marginBottom: "12px" }}>
          Envie d’une création unique ?
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "17px",
            color: "var(--text-muted)",
            marginBottom: "28px",
          }}
        >
          Chaque commande est une belle aventure.
          {artisan?.contact?.email && " Je serais ravie de créer quelque chose rien que pour vous."}
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/boutique" className="btn btn--primary">
            Découvrir la boutique
          </Link>
          {artisan?.contact?.email && (
            <a
              href={`mailto:${artisan.contact.email}`}
              className="btn btn--outline"
            >
              Me contacter
            </a>
          )}
        </div>
      </section>
    </>
  );
}
