import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header, type NavigationLink } from "@/components/Header";
import styles from "./payment.module.css";

const paymentNavigation: NavigationLink[] = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#contact", label: "Contact" }
];

export function PaymentShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <Header links={paymentNavigation} cta={null} homeHref="/" />
      <main className={styles.main}>{children}</main>
      <Footer links={paymentNavigation} homeHref="/" />
    </div>
  );
}
