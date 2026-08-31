import {
  campaignCrmConfiguration,
  forwardCampaignRequest
} from "../../../campaign/crm.ts";
import {
  hasJsonContentType,
  hasSameOrigin,
  parseUnsubscribeEmailRequest,
  PayloadTooLargeError,
  readBoundedBody
} from "../request.ts";

const GENERIC_ERROR =
  "We couldn’t send a confirmation link right now. Please try again.";

function errorResponse(status: number) {
  return Response.json(
    { error: GENERIC_ERROR },
    {
      status,
      headers: { "Cache-Control": "no-store" }
    }
  );
}

export async function unsubscribeEmailRequestPost(request: Request) {
  if (!hasSameOrigin(request)) {
    return errorResponse(403);
  }

  if (!hasJsonContentType(request)) {
    return errorResponse(415);
  }

  let body: unknown;

  try {
    body = JSON.parse(await readBoundedBody(request));
  } catch (error) {
    return errorResponse(error instanceof PayloadTooLargeError ? 413 : 400);
  }

  const unsubscribeRequest = parseUnsubscribeEmailRequest(body);
  if (!unsubscribeRequest) {
    return errorResponse(400);
  }

  const crm = campaignCrmConfiguration("Marketing unsubscribe confirmation");
  if (!crm) {
    return errorResponse(500);
  }

  try {
    const response = await forwardCampaignRequest({
      crm,
      path: "/api/marketing/unsubscribe/request",
      body: unsubscribeRequest
    });

    if (!response.ok) {
      console.error("Marketing unsubscribe confirmation CRM request failed", {
        status: response.status
      });
      return errorResponse(502);
    }
  } catch (error) {
    console.error("Marketing unsubscribe confirmation CRM request could not be completed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(502);
  }

  // The CRM always returns this result for a syntactically valid email, whether
  // the address is known, ineligible, already opted out, or unknown.
  return Response.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
