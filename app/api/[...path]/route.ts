import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { isAdmin, checkPassword, signSession } from "@/lib/auth";
import {
  content,
  getRecord,
  putRecord,
  listRecords,
  insertRecord,
  audit,
} from "@/lib/store";
import {
  contactSchema,
  checkoutSchema,
  donationSchema,
  orderTotals,
  contentSchema,
  catalogVisible,
} from "@/lib/validation";
import { transition } from "@/lib/payments";
export const runtime = "nodejs";
const limits = new Map<string, { at: number; n: number }>();
function response(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const route = path.join("/");
  const admin = await isAdmin();
  try {
    if (req.method !== "GET") {
      if (
        !req.headers.get("origin") ||
        new URL(req.headers.get("origin")!).host !== req.headers.get("host") ||
        (process.env.APP_ORIGIN &&
          req.headers.get("origin") !== process.env.APP_ORIGIN)
      )
        return response({ error: "Invalid request origin" }, 403);
      const key =
        (req.headers.get("x-forwarded-for") || "local").split(",")[0] + route;
      const now = Date.now();
      let bucket = limits.get(key);
      if (!bucket || now - bucket.at > 60000) {
        bucket = { at: now, n: 0 };
        limits.set(key, bucket);
      }
      if (++bucket.n > 20)
        return response(
          { error: "Too many requests. Please wait a minute." },
          429,
        );
      if (limits.size > 10000) limits.clear();
      if (
        route !== "admin/media" &&
        Number(req.headers.get("content-length") || 0) > 200000
      )
        return response({ error: "Request too large" }, 413);
    }
    if (route === "content" && req.method === "GET") {
      const c = await content();
      const preview =
        process.env.NODE_ENV !== "production" ||
        process.env.INTERNAL_PREVIEW === "true";
      return response({
        ...c,
        products: c.products.filter((p) => catalogVisible(p, preview)),
        campaigns: c.campaigns.filter((p) => preview || p.published),
        projects: c.projects.filter((p) => p.published),
        teams: c.teams.filter((t) => t.published),
        preview,
        mediaApproved: process.env.MEDIA_APPROVED === "true",
        paymentMode: "test",
      });
    }
    if (path[0] === "media" && req.method === "GET") {
      const preview =
        process.env.NODE_ENV !== "production" ||
        process.env.INTERNAL_PREVIEW === "true";
      if (!preview && !admin && process.env.MEDIA_APPROVED !== "true")
        return response({ error: "Asset awaiting publication consent" }, 403);
      const name = path[1] || "";
      if (!/^[a-z0-9-]+\.(png|webp|jpg|jpeg)$/.test(name))
        return response({ error: "Not found" }, 404);
      try {
        const file = await readFile(resolve("references", name));
        return new NextResponse(file, {
          headers: {
            "Content-Type": name.endsWith(".webp")
              ? "image/webp"
              : name.endsWith(".png")
                ? "image/png"
                : "image/jpeg",
            "Cache-Control": "private, max-age=300",
          },
        });
      } catch {
        return response({ error: "Not found" }, 404);
      }
    }
    if (route === "auth/config")
      return response({
        supabase: !!process.env.SUPABASE_URL,
        local:
          process.env.NODE_ENV !== "production" && !!process.env.ADMIN_PASSWORD,
      });
    if (route === "auth/session" && req.method === "GET")
      return response({ admin });
    if (route === "auth/logout" && req.method === "POST") {
      (await cookies()).delete("sabai_admin");
      return response({ ok: true });
    }
    if (route === "auth/login" && req.method === "POST") {
      const b = await req.json();
      let token = "";
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        const sb = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
        );
        const { data, error } = await sb.auth.signInWithPassword({
          email: String(b.email),
          password: String(b.password),
        });
        if (error || data.user?.app_metadata?.role !== "admin")
          return response({ error: "Access denied" }, 401);
        token = "sb:" + data.session!.access_token;
      } else {
        if (
          typeof b.password !== "string" ||
          b.password.length > 200 ||
          !checkPassword(b.password)
        )
          return response(
            {
              error:
                "Access denied. Configure Supabase Auth or a local development password.",
            },
            401,
          );
        token = signSession();
      }
      (await cookies()).set("sabai_admin", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600,
      });
      await audit("admin.login", {});
      return response({ ok: true });
    }
    if (route === "auth/reset" && req.method === "POST") {
      const b = await req.json();
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        const sb = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
        );
        await sb.auth.resetPasswordForEmail(String(b.email), {
          redirectTo: req.nextUrl.origin + "/admin/reset",
        });
      }
      return response({
        ok: true,
        message:
          "If an account exists, the configured auth provider will send recovery instructions.",
      });
    }
    if (route === "auth/recovery" && req.method === "POST") {
      const b = await req.json();
      if (
        !process.env.SUPABASE_URL ||
        !process.env.SUPABASE_ANON_KEY ||
        typeof b.accessToken !== "string" ||
        typeof b.password !== "string" ||
        b.password.length < 12 ||
        b.password.length > 200
      )
        return response(
          {
            error:
              "A valid recovery link and a password of at least 12 characters are required.",
          },
          400,
        );
      const sb = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: "Bearer " + b.accessToken } } },
      );
      const { data, error } = await sb.auth.getUser(b.accessToken);
      if (error || data.user?.app_metadata?.role !== "admin")
        return response({ error: "Invalid or expired recovery session" }, 401);
      const result = await sb.auth.updateUser({ password: b.password });
      if (result.error)
        return response(
          {
            error:
              "Password could not be updated. Request a new recovery email.",
          },
          400,
        );
      await audit("admin.password.reset", {});
      return response({ ok: true });
    }
    if (route.startsWith("admin")) {
      if (!admin)
        return response({ error: "Administrator access required" }, 401);
      if (route === "admin/media") {
        if (req.method === "GET")
          return response({
            files: (await readdir(resolve("references"))).filter((n) =>
              /\.(png|webp|jpe?g)$/.test(n),
            ),
          });
        const form = await req.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size > 5 * 1024 * 1024)
          return response({ error: "Choose an image up to 5 MB" }, 400);
        const bytes = Buffer.from(await file.arrayBuffer());
        const ext = bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "png"
          : bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
            ? "jpg"
            : bytes.toString("ascii", 0, 4) === "RIFF" &&
                bytes.toString("ascii", 8, 12) === "WEBP"
              ? "webp"
              : null;
        if (!ext)
          return response(
            { error: "Only PNG, JPEG and WebP images are supported" },
            400,
          );
        const name = "upload-" + crypto.randomUUID() + "." + ext;
        await mkdir(resolve("references"), { recursive: true });
        await writeFile(resolve("references", name), bytes, { flag: "wx" });
        await audit("media.uploaded", { name });
        return response({ name });
      }
      if (route === "admin" && req.method === "GET")
        return response({
          content: await content(),
          orders: await listRecords("orders"),
          donations: await listRecords("donations"),
          contacts: await listRecords("contacts"),
          audit: await listRecords("audit"),
        });
      if (route === "admin/content" && req.method === "POST") {
        const value = contentSchema.parse(await req.json());
        await putRecord("content", "site", value);
        await audit("content.updated", {});
        return response({ ok: true });
      }
      if (route === "admin/status" && req.method === "POST") {
        const b = await req.json();
        if (!["orders", "contacts"].includes(b.kind))
          return response({ error: "Invalid record type" }, 400);
        const r = await getRecord<Record<string, unknown>>(b.kind, b.id);
        if (!r) return response({ error: "Record not found" }, 404);
        if (
          b.kind === "orders" &&
          (!transition(String(r.status), b.status) ||
            b.status === "demo_confirmed")
        )
          return response(
            {
              error:
                "Invalid fulfillment transition. Payments cannot be manually marked paid.",
            },
            400,
          );
        if (
          b.kind === "contacts" &&
          !["new", "reviewed", "archived"].includes(b.status)
        )
          return response({ error: "Invalid status" }, 400);
        await putRecord(b.kind, b.id, { ...r, status: b.status });
        await audit("record.status", {
          kind: b.kind,
          id: b.id,
          status: b.status,
        });
        return response({ ok: true });
      }
    }
    if (route === "contact" && req.method === "POST") {
      const b = contactSchema.parse(await req.json());
      const id = crypto.randomUUID();
      await putRecord("contacts", id, {
        ...b,
        id,
        status: "new",
        createdAt: new Date().toISOString(),
      });
      return response({
        id,
        message:
          "Your message has been saved for team review. This prototype does not send email.",
      });
    }
    if (["checkout", "donate"].includes(route) && req.method === "POST") {
      const key = req.headers.get("idempotency-key");
      if (!key || !/^[-a-zA-Z0-9]{16,80}$/.test(key))
        return response({ error: "A valid idempotency key is required" }, 400);
      const b =
        route === "checkout"
          ? checkoutSchema.parse(await req.json())
          : donationSchema.parse(await req.json());
      const hash = createHash("sha256").update(JSON.stringify(b)).digest("hex");
      const kind = route === "checkout" ? "orders" : "donations";
      const old = await getRecord<Record<string, unknown>>(kind, key);
      if (old) {
        if (old.hash !== hash)
          return response(
            { error: "Idempotency key already used for another request" },
            409,
          );
        return response({
          id: old.id,
          token: old.token,
          status: old.status,
          mode: "test",
        });
      }
      const c = await content();
      let totals = null;
      if ("items" in b) {
        if (b.delivery === "pickup" && !c.settings.pickup)
          return response({ error: "Pickup is unavailable" }, 400);
        totals = orderTotals(
          b.items,
          c.products.filter((p) =>
            catalogVisible(
              p,
              process.env.NODE_ENV !== "production" ||
                process.env.INTERNAL_PREVIEW === "true",
            ),
          ),
          c.settings.shipping,
          b.delivery,
          b.donation,
          c.settings.pickupFee,
        );
      }
      const record = {
        ...b,
        id: key,
        hash,
        token: randomBytes(32).toString("hex"),
        status: "pending_payment",
        mode: "test",
        currency: "USD",
        totals,
        amountMinor: "amount" in b ? Math.round(b.amount * 100) : totals?.total,
        recipient: null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        provider: "test",
        lineItems:
          "items" in b
            ? b.items.map((i) => {
                const p = c.products.find((p) => p.id === i.id)!;
                return {
                  ...i,
                  title: p.title,
                  unitPrice: p.price,
                  currency: "USD",
                  preorder: p.preorder,
                };
              })
            : undefined,
        createdAt: new Date().toISOString(),
        notice: "TEST RECORD — no money collected; no stock reserved.",
      };
      const saved = (await insertRecord(kind, key, record)) as typeof record;
      if (saved.hash !== hash)
        return response({ error: "Idempotency conflict" }, 409);
      await audit("test.intent.created", { id: key, kind });
      return response({
        id: saved.id,
        token: saved.token,
        status: saved.status,
        mode: "test",
      });
    }
    if (path[0] === "receipt" && req.method === "GET") {
      const kind =
        req.nextUrl.searchParams.get("kind") === "orders"
          ? "orders"
          : "donations";
      const r = await getRecord<Record<string, unknown>>(kind, path[1]);
      if (!r || r.token !== req.headers.get("x-receipt-token"))
        return response({ error: "Record not found" }, 404);
      if (
        r.status === "pending_payment" &&
        r.expiresAt &&
        Date.parse(String(r.expiresAt)) < Date.now()
      ) {
        r.status = "expired";
        await putRecord(kind, path[1], r);
      }
      const { hash: _, token: __, ...safe } = r;
      void _;
      void __;
      return response(safe);
    }
    if (
      ["payments/simulate", "payments/cancel"].includes(route) &&
      req.method === "POST"
    ) {
      const b = await req.json();
      const kind = b.kind === "orders" ? "orders" : "donations";
      const r = await getRecord<Record<string, unknown>>(kind, b.id);
      if (!r || r.token !== b.token || r.mode !== "test")
        return response({ error: "Test intent not found" }, 404);
      if (
        r.status === "pending_payment" &&
        r.expiresAt &&
        Date.parse(String(r.expiresAt)) < Date.now()
      ) {
        await putRecord(kind, b.id, { ...r, status: "expired" });
        return response({ status: "expired", mode: "test" });
      }
      if (route === "payments/cancel") {
        if (r.status === "pending_payment") {
          await putRecord(kind, b.id, { ...r, status: "cancelled" });
          await audit("test.cancelled", { id: b.id });
          return response({ status: "cancelled", mode: "test" });
        }
        return response(
          { error: "Only pending test payments can be cancelled" },
          400,
        );
      }
      if (r.status === "pending_payment") {
        await putRecord(kind, b.id, {
          ...r,
          status: "demo_confirmed",
          confirmedAt: new Date().toISOString(),
        });
        await audit("test.confirmed", { id: b.id });
      }
      return response({
        status: r.status === "pending_payment" ? "demo_confirmed" : r.status,
        mode: "test",
      });
    }
    if (route === "payments/webhook")
      return response(
        { error: "Live provider not configured. No payments accepted." },
        503,
      );
    return response({ error: "Not found" }, 404);
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error)
      return response(
        { error: "Please check the form fields.", issues: error.issues },
        400,
      );
    if (
      error instanceof Error &&
      ["Invalid product or size", "Insufficient inventory"].includes(
        error.message,
      )
    )
      return response({ error: error.message }, 400);
    console.error(
      "Request failed",
      error instanceof Error ? error.name : "Unknown",
    );
    return response(
      { error: "The request could not be completed. Please try again." },
      500,
    );
  }
}
export { handle as GET, handle as POST };
