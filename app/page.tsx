import { notFound } from "next/navigation";
import { getArtisan, getProducts, getTestimonials } from "@/lib/api";
import Hero from "@/components/home/Hero";
import Bandeau from "@/components/layout/Bandeau";
import ProductCard from "@/components/products/ProductCard";
import ValuesSection from "@/components/home/ValuesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import Link from "next/link";

export const revalidate = 3600;

export default async function HomePage() {
  const [artisan, featuredProducts, testimonials] = await Promise.all([
    getArtisan(),
    getProducts({ is_featured: true, page_size: 6 }),
    getTestimonials({ featured_only: true, page_size: 3 }),
  ]);

  if (!artisan) notFound();

  const theme = artisan.theme_config;
  const featuredEyebrow = theme.featured_eyebrow ?? "Nouveautés";
  const featuredTitle = theme.featured_title ?? "Coup de cœur du moment";

  return (
    <>
      <Hero artisan={artisan} />
      <Bandeau items={theme.banner_items as string[] | undefined} />

      {/* Produits en vedette */}
      {featuredProducts?.items?.length > 0 && (
        <section className="section section--creme">
          <div className="section__header">
            <span className="section__eyebrow">{featuredEyebrow}</span>
            <h2 className="section__title">{featuredTitle}</h2>
            <div className="section__line" />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
            }}
          >
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {featuredProducts.total > 6 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href="/boutique" className="btn btn--outline">
                Voir toutes les créations
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Valeurs */}
      <ValuesSection theme={theme} />

      {/* Témoignages */}
      {testimonials?.items?.length > 0 && (
        <TestimonialsSection
          testimonials={testimonials.items}
          theme={theme}
        />
      )}

      {/* Newsletter */}
      <NewsletterSection theme={theme} />
    </>
  );
}
