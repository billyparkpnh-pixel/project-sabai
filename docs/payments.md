# Payment provider integration boundary

Current behavior is an intentionally non-payable test system, not a certified KHQR integration. No official provider or recipient account is known.

A future authorized adapter must:

- Create intents server-side in integer minor units using configured supported currency and approved merchant recipient. Never trust client totals. In one database transaction lock/check available stock and reserve it with an expiry, store order lines/price snapshots, separate merchandise subtotal, shipping and donation, and a unique provider payment ID.
- Generate KHQR only using the authorized provider's supported SDK/API. Store expiring intent IDs and provider timestamps. Never expose credentials in browser bundles or logs. Keep recipient identity and signing secrets server-only in secure environment settings.
- Verify signatures over the provider's exact raw callback bytes, timestamp/replay window and issuer. Enforce unique provider-event IDs. Fetch status through authenticated provider API for reconciliation. `matchesPayment` is only a field-matching helper, not signature verification.
- In an atomic, locked transaction compare intent ID, amount, currency and recipient against stored expectations, check that the pending intent has not expired, then settle once. Record immutable sanitized verification evidence and an audit event. No user screenshots, client clicks or admin override may settle payment.
- Handle duplicate/out-of-order callbacks, temporary outages, cancellation, reservation release and refunds. Reconcile pending records via a scheduled authenticated worker; poll browser status only through opaque receipt authorization. Handle payments received after intent expiry via a manual provider investigation workflow, not a silent paid transition.
- Issue human-readable receipts only after trusted confirmation, distinguishing donations and product revenue. Add provider-sandbox tests for mismatches, signature tampering, duplicate/replayed events, expired intents, concurrency/overselling, rounding and partial failure recovery.

Production collection remains blocked until this work, organization authorization, approved currency/account details and credentialed sandbox end-to-end tests are complete. The current test adapter does not reserve or decrement inventory. Do not re-label simulated records as real receipts.
