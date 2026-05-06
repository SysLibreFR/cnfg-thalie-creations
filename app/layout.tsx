import type { Metadata } from "next";
import "./globals.css";
import { getArtisan, getMenu } from "@/lib/api";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const artisan = await getArtisan();
  if (!artisan) return { title: "Thalie Créations" };
  return {
    title: { default: artisan.name, template: `%s — ${artisan.name}` },
    description: artisan.description ?? undefined,
    openGraph: {
      siteName: artisan.name,
      images: artisan.cover_url ? [artisan.cover_url] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [artisan, menu] = await Promise.all([getArtisan(), getMenu("principal")]);

  return (
    <html lang="fr">
      <body>
        <Nav artisan={artisan} menu={menu} />
        <main>{children}</main>
        <Footer artisan={artisan} />
      </body>
    </html>
  );
}
