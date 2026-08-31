export type CampaignCrmConfiguration = {
  url: string;
  apiSecret: string;
  accessClientId: string;
  accessClientSecret: string;
};

export function campaignCrmConfiguration(
  requestName: string
): CampaignCrmConfiguration | null {
  const url = process.env.BIMSPECT_CRM_URL?.trim().replace(/\/+$/, "");
  const apiSecret = process.env.BIMSPECT_CRM_API_SECRET?.trim();
  const accessClientId = process.env.CF_ACCESS_CLIENT_ID?.trim();
  const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET?.trim();

  if (!url || !apiSecret || !accessClientId || !accessClientSecret) {
    console.error(`${requestName} CRM configuration is incomplete`, {
      hasUrl: Boolean(url),
      hasApiSecret: Boolean(apiSecret),
      hasAccessClientId: Boolean(accessClientId),
      hasAccessClientSecret: Boolean(accessClientSecret)
    });
    return null;
  }

  try {
    new URL(url);
  } catch {
    console.error(`${requestName} CRM URL is invalid`);
    return null;
  }

  return { url, apiSecret, accessClientId, accessClientSecret };
}

export async function forwardCampaignRequest({
  crm,
  path,
  body,
  headers = {}
}: {
  crm: CampaignCrmConfiguration;
  path: string;
  body: unknown;
  headers?: HeadersInit;
}) {
  return fetch(`${crm.url}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${crm.apiSecret}`,
      "CF-Access-Client-Id": crm.accessClientId,
      "CF-Access-Client-Secret": crm.accessClientSecret,
      ...headers
    },
    body: JSON.stringify(body)
  });
}
