import type { Metadata } from "next";
import { PaymentShell } from "@/components/payment/PaymentShell";
import { PricingSection } from "@/components/PricingSection";
import { ContactCTA } from "@/components/ContactCTA";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pricing | BIMSpect" };
export default function PricingPage() {
  return <PaymentShell><PricingSection heading="Choose your BIMSpect access" /><ContactCTA /></PaymentShell>;
}
