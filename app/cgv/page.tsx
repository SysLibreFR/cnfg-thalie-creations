import type { Metadata } from "next";
import { marked } from "marked";
import { getPage } from "@/lib/api";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = { title: "CGV - Conditions Générales de Vente" };
export const revalidate = 3600;

export default async function CgvPage() {
  const page = await getPage("cgv");

  return (
    <>
      <Breadcrumb items={[{ label: "CGV" }]} />
      <section className="section section--white">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", color: "var(--prune)", marginBottom: "32px" }}>
            Conditions Générales de Vente
          </h1>
          {page?.content ? (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: marked(page.content) }}
            />
          ) : (
            <div className="prose-content">
              <p>Contenu à venir.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
