import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? "";

// Maps backend content types to Next.js cache tags and affected paths
const TYPE_MAP: Record<string, { tags: string[]; paths: string[] }> = {
  editorial_block: { tags: ["editorial"], paths: ["/", "/a-propos", "/boutique", "/blog"] },
  product:         { tags: ["product"],   paths: ["/boutique"] },
  artisan:         { tags: ["artisan"],   paths: ["/", "/a-propos", "/boutique", "/blog"] },
  blog:            { tags: [],            paths: ["/blog"] },
  testimonial:     { tags: [],            paths: ["/", "/a-propos"] },
  page:            { tags: [],            paths: ["/mentions-legales"] },
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Validate secret when configured
  if (REVALIDATE_SECRET && body.secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const type = body.type as string | undefined;
  const slug = body.slug as string | undefined;

  const mapping = type ? TYPE_MAP[type] : undefined;

  if (!mapping) {
    // Unknown type: revalidate everything
    revalidatePath("/", "layout");
    console.info("[revalidate] type inconnu « %s » — invalidation globale", type);
    return NextResponse.json({ revalidated: true, type, global: true });
  }

  for (const tag of mapping.tags) {
    revalidateTag(tag);
  }

  for (const path of mapping.paths) {
    revalidatePath(path);
  }

  // Revalidate specific slug page when provided
  if (slug) {
    if (type === "product") revalidatePath(`/boutique/${slug}`);
    if (type === "blog")    revalidatePath(`/blog/${slug}`);
  }

  console.info("[revalidate] %s%s invalidé", type, slug ? ` (${slug})` : "");
  return NextResponse.json({ revalidated: true, type, slug: slug ?? null });
}
