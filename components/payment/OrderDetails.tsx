import { formatOfferAmount } from "@/lib/payment/offer";
import type { PaymentOrder } from "@/lib/payment/types";
import styles from "./payment.module.css";

export function OrderDetails({ order }: { order: PaymentOrder }) {
  return (
    <dl className={styles.orderDetails}>
      <div>
        <dt>Offer</dt>
        <dd>{order.offer.name}</dd>
      </div>
      <div>
        <dt>Amount</dt>
        <dd>
          {formatOfferAmount(order.offer.amount, order.offer.currency) ?? "Not published"}
          {order.offer.billingPeriod ? ` / ${order.offer.billingPeriod}` : ""}
        </dd>
      </div>
      <div>
        <dt>Customer</dt>
        <dd>{order.customer.name}</dd>
      </div>
      <div>
        <dt>Company</dt>
        <dd>{order.customer.company}</dd>
      </div>
      <div>
        <dt>Business email</dt>
        <dd>{order.customer.email}</dd>
      </div>
      <div>
        <dt>Order reference</dt>
        <dd>{order.reference}</dd>
      </div>
    </dl>
  );
}
