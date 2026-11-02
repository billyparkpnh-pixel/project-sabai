import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  type: z.enum([
    "general",
    "volunteer",
    "partnership",
    "merchandise",
    "donation",
    "other",
  ]),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).default(""),
  subject: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(30).default(""),
});
export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(200),
    phone: z.string().regex(/^[+\d ()-]{6,30}$/),
    city: z.string().trim().min(2).max(100),
    address: z.string().trim().max(500),
    delivery: z.enum(["pickup", "shipping"]),
    donation: z.number().min(0).max(10000),
    items: z
      .array(
        z.object({
          id: z.string().max(80),
          size: z.string().max(20),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine((d) => d.delivery !== "shipping" || d.address.length >= 8, {
    message: "Enter a complete delivery address.",
    path: ["address"],
  });
export const donationSchema = z.object({
  amount: z
    .number()
    .min(1)
    .max(10000)
    .refine(
      (n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-7,
      "Use at most two decimal places",
    ),
  name: z.string().trim().max(100).default(""),
  email: z.union([z.email(), z.literal("")]).default(""),
  message: z.string().max(1000).default(""),
});
export function orderTotals(
  items: { id: string; size: string; quantity: number }[],
  products: import("./content").Product[],
  shipping: number | null,
  delivery: string,
  extra: number,
  pickupFee: number | null = 0,
) {
  let subtotal = 0;
  let missingPrice = false;
  for (const item of items) {
    const p = products.find((p) => p.id === item.id);
    if (!p || !p.sizes.includes(item.size))
      throw Error("Invalid product or size");
    const quantity = items
      .filter((i) => i.id === p.id)
      .reduce((n, i) => n + i.quantity, 0);
    if (p.stock !== null && quantity > p.stock)
      throw Error("Insufficient inventory");
    if (p.price === null) missingPrice = true;
    else subtotal += Math.round(p.price * 100) * item.quantity;
  }
  const fee = delivery === "pickup" ? pickupFee : shipping;
  return {
    subtotal: missingPrice ? null : subtotal,
    shipping: fee === null ? null : Math.round(fee * 100),
    donation: Math.round(extra * 100),
    total:
      missingPrice || fee === null
        ? null
        : subtotal + Math.round(fee * 100) + Math.round(extra * 100),
  };
}
export const contentSchema = z
  .object({
    pages: z.object({
      heroImage: z.string(),
      intro: z.string().max(8000),
      mission: z.string().max(8000),
      history: z.string().max(8000),
      partners: z.string().max(8000),
      contact: z.string().max(8000),
    }),
    products: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        description: z.string(),
        image: z.string(),
        frontImage: z.string().optional(),
        backImage: z.string().optional(),
        sizes: z.array(z.string().min(1)),
        color: z.string(),
        preorder: z.boolean(),
        rightsRequired: z.boolean(),
        price: z.number().nonnegative().nullable(),
        stock: z.number().int().nonnegative().nullable(),
        published: z.boolean(),
      }),
    ),
    campaigns: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string(),
        type: z.literal("in-kind"),
        status: z.string(),
        year: z.string(),
        description: z.string(),
        items: z.array(z.string()),
        instructions: z.string(),
        contact: z.string(),
        image: z.string(),
        published: z.boolean(),
      }),
    ),
    projects: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        location: z.string(),
        year: z.string(),
        status: z.enum(["Past", "Current", "Upcoming"]),
        topic: z.string(),
        type: z.string(),
        description: z.string(),
        goals: z.array(z.string()),
        outcomes: z.string(),
        featured: z.boolean(),
        published: z.boolean(),
        image: z.string().optional(),
        video: z.string().url().startsWith("https://").optional(),
        metrics: z.string().optional(),
        fundraising: z.boolean().optional(),
        dates: z.string().optional(),
        activities: z.array(z.string()).optional(),
        gallery: z.array(z.string()).optional(),
        milestones: z.array(z.string()).optional(),
      }),
    ),
    teams: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        name: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean(),
      }),
    ),
    impact: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
        verified: z.boolean(),
      }),
    ),
    settings: z.object({
      shipping: z.number().nonnegative().nullable(),
      pickup: z.boolean(),
      pickupDetails: z.string(),
      currency: z.literal("USD"),
      sharedQrImage: z
        .string()
        .regex(/^$|^qr-reference-[a-f0-9-]+\.png$/)
        .default(""),
      pickupFee: z.number().nonnegative().nullable(),
      fulfillmentWindow: z.string(),
      refundPolicy: z.string(),
      shippingPolicy: z.string(),
      privacyPolicy: z.string(),
      officialContact: z.string(),
    }),
    translations: z.record(z.string(), z.record(z.string(), z.string())),
  })
  .refine(
    (c) =>
      new Set(c.products.map((p) => p.id)).size === c.products.length &&
      new Set(c.projects.map((p) => p.id)).size === c.projects.length,
    "IDs must be unique",
  );

export function catalogVisible(
  p: import("./content").Product,
  preview: boolean,
) {
  return preview || (p.published && !p.rightsRequired);
}
