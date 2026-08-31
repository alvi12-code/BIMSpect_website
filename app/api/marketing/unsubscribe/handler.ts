import { campaignCrmConfiguration, forwardCampaignRequest } from "../../campaign/crm.ts";
import {
  hasJsonContentType,
  hasSameOrigin,
  parseUnsubscribePayload,
  PayloadTooLargeError,
  readBoundedBody
} from "./request.ts";

const INVALID_LINK_ERROR = "This unsubscribe link is not valid.";
const GENERIC_ERROR = "We couldn’t process your request right now. Please try again.";

function errorResponse(status: number, message = GENERIC_ERROR) {
  return Response.json({ error: message }, { status });
}

export async function unsubscribePost(request: Request) {
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
    if (error instanceof PayloadTooLargeError) {
      return errorResponse(413, INVALID_LINK_ERROR);
    }

    return errorResponse(400, INVALID_LINK_ERROR);
  }

  const unsubscribe = parseUnsubscribePayload(body);
  if (!unsubscribe) {
    return errorResponse(400, INVALID_LINK_ERROR);
  }

  const crm = campaignCrmConfiguration("Marketing unsubscribe");
  if (!crm) {
    return errorResponse(500);
  }

  try {
    const response = await forwardCampaignRequest({
      crm,
      path: "/api/marketing/unsubscribe",
      body: unsubscribe
    });

    if (!response.ok) {
      console.error("Marketing unsubscribe CRM request failed", {
        status: response.status
      });
      return errorResponse(502);
    }
  } catch (error) {
    console.error("Marketing unsubscribe CRM request could not be completed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(502);
  }

  // The CRM intentionally returns the same success result for every
  // well-formed token, including expired, revoked, unknown, or replayed links.
  return Response.json({ success: true });
}
