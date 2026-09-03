import {
  PaymentProviderNotImplementedError,
  type CreatePaymentOrderInput,
  type PaymentOrder,
  type PaymentProvider,
  type PaymentWebhookRequest,
  type PaymentWebhookResult
} from "./types.ts";

export type RevolutMerchantConfiguration = {
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
};

// Deliberately network-free until BIMSpect has real Revolut Merchant account
// details, approved API documentation, and verified webhook requirements.
export class RevolutPaymentProvider implements PaymentProvider {
  readonly name = "revolut" as const;
  private readonly configuration: RevolutMerchantConfiguration;

  constructor(configuration: RevolutMerchantConfiguration) {
    this.configuration = configuration;
  }

  private notImplemented(): never {
    void this.configuration;
    throw new PaymentProviderNotImplementedError(
      "Revolut payments are configured but the Merchant API adapter has not been implemented."
    );
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    void input;
    return this.notImplemented();
  }

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    void orderId;
    return this.notImplemented();
  }

  async handleWebhook(request: PaymentWebhookRequest): Promise<PaymentWebhookResult | null> {
    void request;
    return this.notImplemented();
  }
}
