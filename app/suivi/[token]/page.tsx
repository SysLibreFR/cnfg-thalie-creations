import { trackOrder } from "@/lib/api";
import { notFound } from "next/navigation";
import ClientTracker from "./client";

export const revalidate = 0;

export default async function SuiviPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const order = await trackOrder(token);
    return <ClientTracker order={order} token={token} />;
  } catch {
    notFound();
  }
}
