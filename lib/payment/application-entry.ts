/** Marketing passes only a validated internal offer to the existing auth origin. */
export function applicationPurchaseEntry(environment: Record<string, string | undefined>, offer: "individual" | "project"): string | null {
  if (offer !== "individual") return null;
  if (environment.CHECKOUT_ENABLED?.trim().toLowerCase() !== "true" || environment.PAYMENT_PROVIDER !== "bimspect") return null;
  try {
    const url = new URL(environment.BIMSPECT_APP_ORIGIN || "");
    const local = (environment.NODE_ENV !== "production" || environment.BIMSPECT_LOCAL_SANDBOX === "true") && ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    url.pathname = "/purchase/" + offer;
    return url.href;
  } catch { return null; }
}
export function marketingPurchaseAction(environment: Record<string, string | undefined>, tier: string): { href: string; label: string; offerId?: string } | null {
  if (tier === "Enterprise") return { href: "#contact", label: "Contact sales" };
  if (tier === "Project") return { href: "/?enquiry=plan&plan=project#contact", label: "Request a quote" };
  if (tier !== "Individual") return null;
  const entry = applicationPurchaseEntry(environment, "individual");
  return entry ? { href: entry, label: "Purchase Individual", offerId: "individual" } : null;
}
// Compatibility for existing server-side imports.
export const applicationBillingEntry = applicationPurchaseEntry;
