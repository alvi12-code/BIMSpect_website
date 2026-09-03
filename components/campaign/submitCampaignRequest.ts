import type { CampaignAttribution } from "./attribution";

export type CampaignRequestKind =
  | "homepage-enquiry"
  | "pilot-enquiry"
  | "sample-report";

type CampaignRequest = {
  kind: CampaignRequestKind;
  name: string;
  email: string;
  company?: string;
  message?: string;
  campaign: string;
  attribution: CampaignAttribution;
  turnstile_token?: string;
  idempotencyKey?: string;
};

export type CampaignSubmissionResult = {
  ok: true;
};

export async function submitCampaignRequest(
  request: CampaignRequest
): Promise<CampaignSubmissionResult> {
  const { kind, attribution, idempotencyKey, ...lead } = request;
  void kind;

  const response = await fetch("/api/campaign/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify({ ...lead, ...attribution })
  });

  if (!response.ok) {
    throw new Error("Campaign lead submission failed");
  }

  return { ok: true };
}
