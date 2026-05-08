import { notFound } from "next/navigation";
import { getArtisan, getProducts, getTestimonials, getEditorialBlocks } from "@/lib/api";
import { blockData, hasBlock } from "@/lib/utils";
import type { BlockValueItem } from "@/lib/types";
import Hero from "@/components/home/Hero";
import Bandeau from "@/components/layout/Bandeau";
import ProductCard from "@/components/products/ProductCard";
import ValuesSection from "@/components/home/ValuesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import Link from "next/link";

export const revalidate = 600;

export default async function HomePage() {
  const [artisan, blocks, featuredProducts, testimonials] = await Promise.all([
    getArtisan(),
    getEditorialBlocks(),
    getProducts({ is_featured: true, page_size: 6 }),
    getTestimonials({ featured_only: true, page_size: 3 }),
  ]);

  if (!artisan) notFound();

  const heroData = blockData(blocks, "hero") as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    caption?: string;
  };
  const bandeauData = blockData(blocks, "bandeau") as { items?: string[] };
  const featuredData = blockData(blocks, "featured_products") as {
    eyebrow?: string;
    title?: string;
  };
  const valuesData = blockData(blocks, "values") as {
    eyebrow?: string;
    title?: string;
    items?: BlockValueItem[];
  };
  const testimonialsData = blockData(blocks, "testimonials") as {
    eyebrow?: string;
    title?: string;
  };
  const newsletterData = blockData(blocks, "newsletter") as {
    title?: string;
    subtitle?: string;
  };

  return (
    <>
      <Hero artisan={artisan} data={heroData} />
      <Bandeau items={bandeauData.items} />

      {/* Produits en vedette */}
      {featuredProducts?.items?.length > 0 && (
        <section className="section section--creme">
          <div className="section__header">
            {featuredData.eyebrow && (
              <span className="section__eyebrow">{featuredData.eyebrow}</span>
            )}
            {featuredData.title && (
              <h2 className="section__title">{featuredData.title}</h2>
            )}
            <div className="section__line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
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

      {/* Valeurs / engagements */}
      <ValuesSection data={valuesData} />

      {/* Témoignages */}
      {testimonials?.items?.length > 0 && (
        <TestimonialsSection testimonials={testimonials.items} data={testimonialsData} />
      )}

      {/* Newsletter */}
      {hasBlock(blocks, "newsletter") && (
        <NewsletterSection
          title={newsletterData.title}
          subtitle={newsletterData.subtitle}
        />
      )}
    </>
  );
}
