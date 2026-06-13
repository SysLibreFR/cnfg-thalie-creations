import { notFound } from "next/navigation";
import { getArtisan, getProducts, getTestimonials, getEditorialBlocks } from "@/lib/api";
import { blockData, hasBlock } from "@/lib/utils";
import type { BlockValueItem } from "@/lib/types";
import Hero from "@/components/home/Hero";
import CoverImage from "@/components/home/CoverImage";
import Bandeau from "@/components/layout/Bandeau";
import ProductCard from "@/components/products/ProductCard";
import ValuesSection from "@/components/home/ValuesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import Link from "next/link";

export const revalidate = 600;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function HomePage() {
  const [artisan, blocks, allFeatured, testimonials] = await Promise.all([
    getArtisan(),
    getEditorialBlocks(),
    getProducts({ is_featured: true, include_excluded: true }),
    getTestimonials({ featured_only: true, page_size: 3 }),
  ]);

  if (!artisan) notFound();

  const featuredProducts = allFeatured
    ? { ...allFeatured, items: shuffleArray(allFeatured.items).slice(0, 8) }
    : allFeatured;

  const heroData = blockData(blocks, "hero") as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    caption?: string;
    coin_url?: string;
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
      {artisan.cover_url && <CoverImage src={artisan.cover_url} alt={artisan.name} />}
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
          <div className="cards-grid-4">
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {(allFeatured?.total ?? 0) > 8 && (
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
