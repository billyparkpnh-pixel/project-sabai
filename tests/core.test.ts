import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutSchema,
  contactSchema,
  donationSchema,
  orderTotals,
  contentSchema,
  catalogVisible,
} from "../lib/validation";
import { seed } from "../lib/content";
import {
  matchesPayment,
  transition,
  livePaymentsEnabled,
} from "../lib/payments";
import { validSession, signSession } from "../lib/auth";
test("seed content is editable and schema-valid without fabricated commerce values", () => {
  assert.ok(contentSchema.safeParse(seed).success);
  assert.ok(
    seed.products.every(
      (p) =>
        p.price === 10 &&
        p.stock === null &&
        p.sizes.length === 0 &&
        p.preorder,
    ),
  );
});
test("server calculates integer minor units and keeps donation separate", () => {
  const p = { ...seed.products[0], price: 12.34, stock: 10, sizes: ["M", "L"] };
  assert.deepEqual(
    orderTotals([{ id: p.id, size: "M", quantity: 2 }], [p], 3, "shipping", 5),
    { subtotal: 2468, shipping: 300, donation: 500, total: 3268 },
  );
});
test("unconfigured prices do not become zero-price live orders", () => {
  assert.equal(
    orderTotals(
      [{ id: seed.products[0].id, size: "M", quantity: 1 }],
      seed.products.map((p) => ({ ...p, price: null, sizes: ["M"] })),
      null,
      "shipping",
      0,
    ).total,
    null,
  );
});
test("inventory checks aggregate variants and reject missing products and sizes", () => {
  const p = { ...seed.products[0], stock: 2, sizes: ["M", "L"] };
  assert.throws(() =>
    orderTotals(
      [
        { id: p.id, size: "M", quantity: 2 },
        { id: p.id, size: "L", quantity: 1 },
      ],
      [p],
      0,
      "pickup",
      0,
    ),
  );
  assert.throws(() =>
    orderTotals(
      [{ id: "forged", size: "M", quantity: 1 }],
      [p],
      0,
      "pickup",
      0,
    ),
  );
  assert.throws(() =>
    orderTotals([{ id: p.id, size: "XX", quantity: 1 }], [p], 0, "pickup", 0),
  );
});
test("checkout rejects negative quantities, missing address and invalid contact data", () => {
  const b = {
    name: "Example",
    email: "a@example.com",
    phone: "+85512345678",
    city: "Phnom Penh",
    address: "",
    delivery: "shipping",
    donation: 0,
    items: [{ id: "pharmacy-care", size: "M", quantity: 1 }],
  };
  assert.equal(checkoutSchema.safeParse(b).success, false);
  assert.equal(
    checkoutSchema.safeParse({ ...b, delivery: "pickup" }).success,
    true,
  );
  assert.equal(
    checkoutSchema.safeParse({
      ...b,
      delivery: "pickup",
      items: [{ id: "x", size: "M", quantity: -2 }],
    }).success,
    false,
  );
});
test("contact honeypot, message length and donation constraints enforced", () => {
  const c = {
    name: "Example",
    email: "a@example.com",
    type: "general",
    message: "Hello community team!",
  };
  assert.ok(contactSchema.safeParse(c).success);
  assert.equal(
    contactSchema.safeParse({ ...c, website: "spam" }).success,
    false,
  );
  for (const amount of [-1, 0, 10001, 1.234])
    assert.equal(donationSchema.safeParse({ amount }).success, false);
});
test("fulfillment cannot mark unverified or cancelled payments paid", () => {
  assert.equal(livePaymentsEnabled, false);
  assert.equal(transition("pending_payment", "paid"), false);
  assert.equal(transition("cancelled", "processing"), false);
  assert.equal(transition("demo_confirmed", "processing"), true);
  assert.equal(transition("shipped", "delivered"), true);
});
test("verification matches recipient, amount, currency, IDs and freshness", () => {
  const expected = {
    id: "intent-1",
    amountMinor: 500,
    currency: "USD",
    recipient: "authorized-account",
  };
  const event = {
    providerId: "provider-1",
    intentId: "intent-1",
    amountMinor: 500,
    currency: "USD",
    recipient: "authorized-account",
    occurredAt: new Date().toISOString(),
  };
  assert.ok(matchesPayment(expected, event));
  for (const change of [
    { amountMinor: 501 },
    { currency: "KHR" },
    { recipient: "other" },
    { intentId: "other" },
    { providerId: "" },
    { occurredAt: "2020-01-01" },
  ])
    assert.equal(matchesPayment(expected, { ...event, ...change }), false);
});
test("signed admin sessions reject tampering and expiration", () => {
  const session = signSession();
  assert.ok(validSession(session));
  assert.equal(validSession(session + "0"), false);
  assert.equal(validSession("1.anything"), false);
  assert.equal(validSession(""), false);
});

test("ten unique $10 preorder designs, two supplied mockups and eight placeholders", () => {
  assert.equal(seed.products.length, 10);
  assert.equal(new Set(seed.products.map((p) => p.id)).size, 10);
  assert.equal(seed.products.filter((p) => !!p.image).length, 2);
  assert.equal(seed.products.filter((p) => p.id === "night-shift").length, 1);
  assert.deepEqual(
    orderTotals(
      [{ id: "pharmacy-care", size: "M", quantity: 2 }],
      seed.products.map((p) => ({ ...p, sizes: ["M"] })),
      null,
      "pickup",
      0,
      null,
    ),
    { subtotal: 2000, shipping: null, donation: 0, total: null },
  );
});

test("licensing-restricted product stays hidden from public catalog", () => {
  const product = seed.products.find((p) => p.rightsRequired)!;
  assert.equal(catalogVisible({ ...product, published: true }, false), false);
  assert.equal(catalogVisible(product, true), true);
});
