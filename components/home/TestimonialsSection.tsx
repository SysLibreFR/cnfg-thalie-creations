import Image from "next/image";
import type { Testimonial } from "@/lib/types";
import StarRating from "@/components/ui/StarRating";

interface TestimonialsBlockData {
  eyebrow?: string;
  title?: string;
}

export default function TestimonialsSection({
  testimonials,
  data,
}: {
  testimonials: Testimonial[];
  data: TestimonialsBlockData;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="section section--creme">
      {(data.eyebrow || data.title) && (
        <div className="section__header">
          {data.eyebrow && <span className="section__eyebrow">{data.eyebrow}</span>}
          {data.title && <h2 className="section__title">{data.title}</h2>}
          <div className="section__line" />
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(testimonials.length, 3)}, 1fr)`,
          gap: "20px",
        }}
      >
        {testimonials.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid var(--creme-dark)",
            }}
          >
            <StarRating rating={t.rating} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.7, margin: "12px 0 16px" }}>
              « {t.content} »
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {t.avatar_url ? (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  <Image src={t.avatar_url} alt={t.author_name} fill className="object-cover" />
                </div>
              ) : (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--lavande-pale)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Josefin Sans', sans-serif", fontSize: "11px", color: "var(--prune)" }}>
                  {t.author_name[0]}
                </div>
              )}
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", fontWeight: 500, color: "var(--prune)" }}>{t.author_name}</p>
                {t.author_role && <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{t.author_role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
