export type UnsubscribeRequestResult = "success" | "invalid" | "error";

export async function submitUnsubscribe(
  token: string
): Promise<UnsubscribeRequestResult> {
  const response = await fetch("/api/marketing/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ token })
  });

  if (response.ok) {
    return "success";
  }

  return response.status === 400 ? "invalid" : "error";
}

export type UnsubscribeEmailRequestResult = "success" | "invalid" | "error";

export async function requestUnsubscribeConfirmation(
  email: string
): Promise<UnsubscribeEmailRequestResult> {
  const response = await fetch("/api/marketing/unsubscribe/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email })
  });

  if (response.ok) {
    return "success";
  }

  return response.status === 400 ? "invalid" : "error";
}
