import type { ThemeConfig, ValueItem } from "@/lib/types";

const DEFAULT_VALUES: ValueItem[] = [
  { icon: "🧶", title: "Fait main", text: "Chaque pièce est crochée à la main, une à une" },
  { icon: "✨", title: "Pièce unique", text: "Aucune création n'est strictement identique" },
  { icon: "🌱", title: "Matières douces", text: "Fils sélectionnés pour leur douceur et qualité" },
  { icon: "💌", title: "Personnalisé", text: "Couleurs, tailles, prénoms brodés sur demande" },
];

export default function ValuesSection({ theme }: { theme: ThemeConfig }) {
  const eyebrow = theme.values_eyebrow ?? "Mes engagements";
  const title = theme.values_title ?? "L’artisanat dans l’âme";
  const values: ValueItem[] = theme.values?.length ? (theme.values as ValueItem[]) : DEFAULT_VALUES;

  return (
    <section className="section section--white">
      <div className="section__header">
        <span className="section__eyebrow">{eyebrow}</span>
        <h2 className="section__title">{title}</h2>
        <div className="section__line" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(values.length, 4)}, 1fr)`,
          gap: "18px",
        }}
      >
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "28px 18px",
              borderRadius: "16px",
              background: "var(--creme)",
            }}
          >
            <span style={{ fontSize: "28px", marginBottom: "12px", display: "block" }}>
              {v.icon}
            </span>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "var(--prune)",
                marginBottom: "8px",
              }}
            >
              {v.title}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {v.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
