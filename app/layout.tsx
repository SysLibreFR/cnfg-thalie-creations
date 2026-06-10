import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Nunito, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { getArtisan, getMenu } from "@/lib/api";
import { CartProvider } from "@/hooks/CartContext";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-nunito",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-josefin",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const artisan = await getArtisan();
  if (!artisan) return { title: "Thalie Créations" };
  return {
    title: { default: artisan.name, template: `%s — ${artisan.name}` },
    description: artisan.description || "Boutique de créations artisanales faites main avec soin.",
    openGraph: {
      siteName: artisan.name,
      images: artisan.cover_url ? [artisan.cover_url] : [],
    },
    icons: {
      icon: "/favicon.svg",
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
    <html lang="fr" className={`${playfair.variable} ${cormorant.variable} ${nunito.variable} ${josefin.variable}`}>
      <body>
        <CartProvider>
          <Nav artisan={artisan} menu={menu} />
          <main>{children}</main>
          <Footer artisan={artisan} />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
