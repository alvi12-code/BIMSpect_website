import type { Metadata } from "next";
import { PaymentOutcome } from "@/components/payment/PaymentOutcome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment not completed | BIMSpect", robots: { index: false } };

export default async function PaymentFailedPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const query = await searchParams;
  return <PaymentOutcome outcome="failed" orderId={typeof query.order === "string" ? query.order : undefined} />;
}
