import type { BlockValueItem } from "@/lib/types";

interface ValuesBlockData {
  eyebrow?: string;
  title?: string;
  items?: BlockValueItem[];
}

export default function ValuesSection({ data }: { data: ValuesBlockData }) {
  const eyebrow = data.eyebrow ?? "";
  const title = data.title ?? "";
  const items: BlockValueItem[] = data.items ?? [];

  if (!items.length && !title) return null;

  return (
    <section className="section section--white">
      {(eyebrow || title) && (
        <div className="section__header">
          {eyebrow && <span className="section__eyebrow">{eyebrow}</span>}
          {title && <h2 className="section__title">{title}</h2>}
          <div className="section__line" />
        </div>
      )}
      {items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
            gap: "18px",
          }}
        >
          {items.map((v, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "28px 18px",
                borderRadius: "16px",
                background: "var(--creme)",
              }}
            >
              <span style={{ fontSize: "28px", marginBottom: "12px", display: "block" }}>{v.icon}</span>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 500, color: "var(--prune)", marginBottom: "8px" }}>{v.title}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>{v.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
