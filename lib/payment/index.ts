import { MockPaymentProvider } from "./mock-provider.ts";
import { RevolutPaymentProvider, type RevolutMerchantConfiguration } from "./revolut-provider.ts";
import {
  PaymentProviderConfigurationError,
  type PaymentProvider,
  type PaymentProviderName
} from "./types.ts";

export * from "./offer.ts";
export * from "./types.ts";

export function isCheckoutEnabled() {
  return process.env.CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}

function configuredProviderName(): PaymentProviderName {
  const value = process.env.PAYMENT_PROVIDER?.trim().toLowerCase() || "mock";
  if (value === "mock" || value === "revolut") {
    return value;
  }

  throw new PaymentProviderConfigurationError(
    "PAYMENT_PROVIDER must be set to either 'mock' or 'revolut'."
  );
}

function revolutConfiguration(): RevolutMerchantConfiguration {
  const secretKey = process.env.REVOLUT_MERCHANT_SECRET_KEY?.trim();
  const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET?.trim();
  const apiVersion = process.env.REVOLUT_MERCHANT_API_VERSION?.trim();

  if (!secretKey || !webhookSecret || !apiVersion) {
    throw new PaymentProviderConfigurationError(
      "Revolut payment mode requires REVOLUT_MERCHANT_SECRET_KEY, REVOLUT_WEBHOOK_SECRET, and REVOLUT_MERCHANT_API_VERSION."
    );
  }

  return { secretKey, webhookSecret, apiVersion };
}

export function paymentProviderName(): PaymentProviderName {
  return configuredProviderName();
}

export function getPaymentProvider(): PaymentProvider {
  const provider = configuredProviderName();
  return provider === "mock"
    ? new MockPaymentProvider()
    : new RevolutPaymentProvider(revolutConfiguration());
}
