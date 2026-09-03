"use client";

import {
  paymentEventProperties,
  trackBimspectEvent
} from "@/components/campaign/analytics";

export function BuyNowLink({
  className,
  href,
  label,
  offerId
}: {
  className: string;
  href: string;
  label: string;
  offerId: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        trackBimspectEvent("buy_clicked", paymentEventProperties({ offerId }));
      }}
    >
      {label}
    </a>
  );
}
