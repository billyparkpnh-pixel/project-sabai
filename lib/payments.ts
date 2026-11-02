/** No live provider is registered. A real adapter must validate signed callbacks,
 * replay window, payment/recipient IDs, amount and currency before settlement. */
export interface VerifiedPayment {
  providerId: string;
  intentId: string;
  amountMinor: number;
  currency: string;
  recipient: string;
  occurredAt: string;
}
export function matchesPayment(
  expected: {
    id: string;
    amountMinor: number;
    currency: string;
    recipient: string;
  },
  event: VerifiedPayment,
) {
  return (
    expected.id === event.intentId &&
    expected.amountMinor === event.amountMinor &&
    expected.currency === event.currency &&
    expected.recipient === event.recipient &&
    !!event.providerId &&
    Math.abs(Date.now() - Date.parse(event.occurredAt)) < 300000
  );
}
export const paymentMode = "test" as const;
export const livePaymentsEnabled = false;
export function transition(current: string, next: string) {
  const allowed: Record<string, string[]> = {
    pending_payment: ["demo_confirmed", "cancelled"],
    demo_confirmed: ["processing", "cancelled"],
    paid: ["processing", "cancelled"],
    processing: ["ready_for_pickup", "shipped", "cancelled"],
    ready_for_pickup: ["delivered", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  return (allowed[current] || []).includes(next);
}

export type ProviderIntent = {
  id: string;
  amountMinor: number;
  currency: string;
  recipient: string;
  expiresAt: string;
  qrPayload: string;
  bankAppUrl?: string;
};
export interface AuthorizedPaymentProvider {
  createIntent(input: {
    reference: string;
    amountMinor: number;
    currency: string;
    recipient: string;
    idempotencyKey: string;
  }): Promise<ProviderIntent>;
  verifyCallback(
    rawBody: Uint8Array,
    headers: Headers,
  ): Promise<VerifiedPayment>;
  getVerifiedStatus(providerId: string): Promise<VerifiedPayment | null>;
}
// bankAppUrl may ONLY come unchanged from an authorized provider response.
// The test adapter intentionally supplies neither a payable QR nor an app URL.
