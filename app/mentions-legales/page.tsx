import type { Metadata } from "next";
import { getArtisan, getPage } from "@/lib/api";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = { title: "Mentions légales" };
export const revalidate = 3600;

export default async function MentionsLegalesPage() {
  const [artisan, page] = await Promise.all([
    getArtisan(),
    getPage("mentions-legales"),
  ]);

  const contact = artisan?.contact ?? {};

  return (
    <>
      <Breadcrumb items={[{ label: "Mentions légales" }]} />
      <section className="section section--white">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", color: "var(--prune)", marginBottom: "32px" }}>
            Mentions légales
          </h1>
          {page?.content ? (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <>
              {artisan && (
                <div className="prose-content">
                  <h2>Responsable de publication</h2>
                  <p>{artisan.name}</p>
                  {contact.email && <p>Contact : {contact.email as string}</p>}
                  {contact.address && <p>Adresse : {contact.address as string}</p>}
                  <h2>Hébergement</h2>
                  <p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
