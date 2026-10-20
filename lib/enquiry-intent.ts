// Finite enquiry context shared by plan CTAs, the enquiry form and the lead
// route. Links carry only these identifiers (for example
// `/?enquiry=plan&plan=project#contact`); visitor details never enter a URL.
// Labels below are application-owned form context, not plan or pricing copy.

export const ENQUIRY_PLANS = ["individual", "project", "enterprise"] as const;
export type EnquiryPlan = (typeof ENQUIRY_PLANS)[number];

export type RequestPurpose = "general-enquiry" | "plan-enquiry" | "sample-report";

export type EnquiryIntent =
  | { purpose: "general-enquiry" }
  | { purpose: "plan-enquiry"; plan: EnquiryPlan }
  | { purpose: "sample-report" };

export const GENERAL_ENQUIRY: EnquiryIntent = { purpose: "general-enquiry" };
export const SAMPLE_REPORT_REQUEST: EnquiryIntent = { purpose: "sample-report" };

export const ENQUIRY_PURPOSE_PARAM = "enquiry";
export const ENQUIRY_PLAN_PARAM = "plan";
export const ENQUIRY_FRAGMENT = "contact";

const PLAN_PURPOSE_VALUE = "plan";
const SAMPLE_PURPOSE_VALUE = "sample-report";

export type EnquiryLabelLocale = "en" | "fi";

const PLAN_LABELS: Record<EnquiryPlan, string> = {
  individual: "BIMSpect Individual",
  project: "BIMSpect Project",
  enterprise: "BIMSpect Enterprise"
};

// English labels also head the CRM message, so leads read consistently.
const PURPOSE_LABELS: Record<RequestPurpose, string> = {
  "general-enquiry": "General enquiry",
  "plan-enquiry": "Plan enquiry",
  "sample-report": "Sample report request"
};

const FINNISH_PURPOSE_LABELS: Record<RequestPurpose, string> = {
  "general-enquiry": "Yleinen kysymys",
  "plan-enquiry": "Pakettitiedustelu",
  "sample-report": "Esimerkkiraportin pyyntö"
};

export function isEnquiryPlan(value: unknown): value is EnquiryPlan {
  return typeof value === "string" && (ENQUIRY_PLANS as readonly string[]).includes(value);
}

export function planEnquiry(plan: EnquiryPlan): EnquiryIntent {
  return { purpose: "plan-enquiry", plan };
}

// Pricing data names plans by display tier ("Project"); map it to the finite id.
export function enquiryPlanForTier(tier: string): EnquiryPlan | null {
  const plan = tier.trim().toLowerCase();
  return isEnquiryPlan(plan) ? plan : null;
}

export function enquiryIntentLabel(
  intent: EnquiryIntent,
  locale: EnquiryLabelLocale = "en"
): string {
  const purposes = locale === "fi" ? FINNISH_PURPOSE_LABELS : PURPOSE_LABELS;
  return intent.purpose === "plan-enquiry"
    ? `${purposes[intent.purpose]}: ${PLAN_LABELS[intent.plan]}`
    : purposes[intent.purpose];
}

// One select value per intent, so the visible control states purpose and plan.
export type EnquiryOptionValue = "general-enquiry" | EnquiryPlan | "sample-report";

export const ENQUIRY_OPTIONS: EnquiryIntent[] = [
  GENERAL_ENQUIRY,
  ...ENQUIRY_PLANS.map(planEnquiry),
  SAMPLE_REPORT_REQUEST
];

export function enquiryOptionValue(intent: EnquiryIntent): EnquiryOptionValue {
  return intent.purpose === "plan-enquiry" ? intent.plan : intent.purpose;
}

export function intentFromOptionValue(value: string): EnquiryIntent {
  if (isEnquiryPlan(value)) {
    return planEnquiry(value);
  }

  return value === "sample-report" ? SAMPLE_REPORT_REQUEST : GENERAL_ENQUIRY;
}

// Returns null when the query carries no enquiry context, so callers can keep
// their current state. Unknown or malformed context falls back to general.
export function readEnquiryIntent(search: string | URLSearchParams): EnquiryIntent | null {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const purpose = params.get(ENQUIRY_PURPOSE_PARAM);
  const plan = params.get(ENQUIRY_PLAN_PARAM);

  if (purpose === null && plan === null) {
    return null;
  }

  if (purpose === PLAN_PURPOSE_VALUE && isEnquiryPlan(plan)) {
    return planEnquiry(plan);
  }

  if (purpose === SAMPLE_PURPOSE_VALUE && plan === null) {
    return SAMPLE_REPORT_REQUEST;
  }

  return GENERAL_ENQUIRY;
}

// Replaces only the enquiry parameters; unrelated parameters such as UTM tags
// are kept. Returns "" or a "?"-prefixed query string.
export function searchWithEnquiryIntent(search: string, intent: EnquiryIntent): string {
  const params = new URLSearchParams(search);
  params.delete(ENQUIRY_PURPOSE_PARAM);
  params.delete(ENQUIRY_PLAN_PARAM);

  if (intent.purpose === "plan-enquiry") {
    params.set(ENQUIRY_PURPOSE_PARAM, PLAN_PURPOSE_VALUE);
    params.set(ENQUIRY_PLAN_PARAM, intent.plan);
  } else if (intent.purpose === "sample-report") {
    params.set(ENQUIRY_PURPOSE_PARAM, SAMPLE_PURPOSE_VALUE);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function enquiryHref(
  intent: EnquiryIntent,
  { path = "", search = "" }: { path?: string; search?: string } = {}
): string {
  return `${path}${searchWithEnquiryIntent(search, intent)}#${ENQUIRY_FRAGMENT}`;
}

// Submission fields sent by the browser and validated again by the lead route.
export type EnquiryContextFields = {
  request_purpose: RequestPurpose;
  plan_interest?: EnquiryPlan;
};

export function enquiryContextFields(intent: EnquiryIntent): EnquiryContextFields {
  return intent.purpose === "plan-enquiry"
    ? { request_purpose: intent.purpose, plan_interest: intent.plan }
    : { request_purpose: intent.purpose };
}

// undefined: legacy request without context; null: invalid context.
export function parseEnquiryContext(
  input: Record<string, unknown>
): EnquiryIntent | undefined | null {
  const purpose = input.request_purpose;
  const plan = input.plan_interest;

  if (purpose === undefined && plan === undefined) {
    return undefined;
  }

  if (purpose === "plan-enquiry") {
    return isEnquiryPlan(plan) ? planEnquiry(plan) : null;
  }

  if (plan !== undefined) {
    return null;
  }

  if (purpose === "general-enquiry") {
    return GENERAL_ENQUIRY;
  }

  return purpose === "sample-report" ? SAMPLE_REPORT_REQUEST : null;
}

// The CRM lead schema is not available in this repository, so context reaches
// it through the existing message field: a server-written header built from
// validated identifiers, followed by the visitor's message unchanged.
export function leadMessageWithContext(intent: EnquiryIntent, message?: string): string {
  const header = [`Request purpose: ${PURPOSE_LABELS[intent.purpose]}`];

  if (intent.purpose === "plan-enquiry") {
    header.push(`Selected plan: ${PLAN_LABELS[intent.plan]}`);
  }

  return message ? `${header.join("\n")}\n\n${message}` : header.join("\n");
}
