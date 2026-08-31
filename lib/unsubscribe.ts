export const UNSUBSCRIBE_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
export const UNSUBSCRIBE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UnsubscribeTokenState = "missing" | "valid" | "invalid";

export function isValidUnsubscribeToken(value: unknown): value is string {
  return typeof value === "string" && UNSUBSCRIBE_TOKEN_PATTERN.test(value);
}

export function unsubscribeTokenState(value: string | null): UnsubscribeTokenState {
  if (value === null) {
    return "missing";
  }

  return isValidUnsubscribeToken(value) ? "valid" : "invalid";
}

export function normalizeUnsubscribeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();

  return email.length <= 254 && UNSUBSCRIBE_EMAIL_PATTERN.test(email)
    ? email
    : null;
}
