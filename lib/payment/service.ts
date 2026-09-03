import { getPaymentOrderCrmAdapter } from "./crm.ts";
import { getPaymentProvider } from "./index.ts";
import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentWebhookRequest,
  PaymentWebhookResult
} from "./types.ts";

export async function createPaymentOrder(
  input: CreatePaymentOrderInput
): Promise<PaymentOrder> {
  const provider = getPaymentProvider();
  const order = await provider.createOrder(input);
  await getPaymentOrderCrmAdapter().record(order);
  return order;
}

export async function getPaymentOrder(orderId: string): Promise<PaymentOrder | null> {
  return getPaymentProvider().getOrder(orderId);
}

export async function processPaymentWebhook(
  request: PaymentWebhookRequest
): Promise<PaymentWebhookResult | null> {
  const provider = getPaymentProvider();
  const result = await provider.handleWebhook(request);

  if (result?.changed) {
    await getPaymentOrderCrmAdapter().record(result.order);
  }

  return result;
}
