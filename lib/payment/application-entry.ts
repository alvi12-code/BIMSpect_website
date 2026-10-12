/** Marketing passes only a validated internal offer to the existing auth origin. */
export function applicationPurchaseEntry(environment: Record<string, string | undefined>, offer: "individual" | "project"): string | null {
  if (offer !== "individual" && offer !== "project") return null;
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
  if (tier !== "Individual" && tier !== "Project") return null;
  const offer = tier === "Project" ? "project" : "individual";
  const entry = applicationPurchaseEntry(environment, offer);
  return entry ? { href: entry, label: tier === "Project" ? "Buy Project" : "Get started", offerId: offer } : null;
}
// Compatibility for existing server-side imports.
export const applicationBillingEntry = applicationPurchaseEntry;
