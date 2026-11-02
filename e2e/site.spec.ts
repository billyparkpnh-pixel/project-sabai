import { test, expect } from "@playwright/test";
test("desktop and mobile pages, product, cart, checkout and test confirmation", async ({
  page,
}) => {
  const origin = "http://127.0.0.1:3001";
  await page.request.post("/api/auth/login", {
    headers: { Origin: origin },
    data: { password: process.env.E2E_PASSWORD },
  });
  const setup = await (await page.request.get("/api/admin")).json();
  setup.content.products = setup.content.products.map(
    (p: Record<string, unknown>) => ({ ...p, sizes: ["M"] }),
  );
  // Explicit synthetic test configuration; never presented as official sizing or fees.
  setup.content.settings.pickupFee = 0;
  setup.content.projects[0].dates = "Example date for rendering test";
  setup.content.projects[0].activities = ["Example planning activity"];
  setup.content.projects[0].gallery = ["takeo-field-visit.png"];
  expect(
    (
      await page.request.post("/api/admin/content", {
        headers: { Origin: origin },
        data: setup.content,
      })
    ).status(),
  ).toBe(200);
  await page.request.post("/api/auth/logout", {
    headers: { Origin: origin },
    data: {},
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Together, we make a difference." }),
  ).toBeVisible();
  await expect(page.locator(".hero-photo")).toBeVisible();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator(".hero-photo").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/sabai-desktop.png", fullPage: true });
  for (const route of [
    "/about",
    "/projects",
    "/contact",
    "/shop",
    "/donate",
    "/admin",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.goto("/projects/takeo-field-visit");
  await expect(page.getByText("Example planning activity")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Project gallery" }),
  ).toBeVisible();
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(10);
  await page.getByLabel("Find your design").fill("Tiramisu");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByText("Design reference not supplied")).toBeVisible();
  await page.goto("/shop/pharmacy-care");
  await page.getByRole("button", { name: "Enlarge full mockup" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Add to test cart" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Added to your test cart",
  );
  await page.getByRole("link", { name: "View cart", exact: true }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(
    page.getByRole("heading", { name: "Conquering Pharmacy Care" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Conquering Pharmacy Care" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to test checkout" }).click();
  await page.getByLabel("Full name").fill("Demo Customer");
  await page.getByLabel("Email address").fill("demo@example.com");
  await page.getByLabel("Phone number").fill("+85512345678");
  await page.getByLabel("Province / city").fill("Phnom Penh");
  await page.getByLabel("I understand this is a test order.").check();
  await page.getByLabel("Optional extra donation").fill("5");
  await expect(page.locator(".summary-line.total")).toContainText("$15.00");
  await page.getByRole("button", { name: "Create test order" }).click();
  await expect(
    page.getByRole("button", { name: "Simulate test confirmation" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Simulate test confirmation" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Demo confirmation recorded" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "/tmp/sabai-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "About Us" }),
  ).toBeVisible();
  for (const route of [
    "/about",
    "/projects",
    "/shop",
    "/shop/night-shift",
    "/donate",
    "/contact",
    "/admin",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route + " fits mobile",
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
test("API access control, tampering, idempotency, contact storage and admin editing", async ({
  request,
  page,
}) => {
  const origin = "http://127.0.0.1:3001";
  expect((await request.get("/api/admin")).status()).toBe(401);
  expect(
    (
      await request.post("/api/contact", {
        data: {},
        headers: { Origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  const key = crypto.randomUUID();
  const headers = { Origin: origin, "Idempotency-Key": key };
  const body = {
    amount: 10,
    name: "Test Donor",
    email: "demo@example.com",
    message: "Test only",
  };
  const r = await request.post("/api/donate", { data: body, headers });
  expect(r.status()).toBe(200);
  const ref = await r.json();
  expect(
    (await request.post("/api/donate", { data: body, headers })).status(),
  ).toBe(200);
  expect(
    (
      await request.post("/api/donate", {
        data: { ...body, amount: 50 },
        headers,
      })
    ).status(),
  ).toBe(409);
  expect(
    (await request.get("/api/receipt/" + ref.id + "?kind=donations")).status(),
  ).toBe(404);
  const saved = await request.get(
    "/api/receipt/" + ref.id + "?kind=donations",
    { headers: { "x-receipt-token": ref.token } },
  );
  expect((await saved.json()).status).toBe("pending_payment");
  const paid = await request.post("/api/payments/simulate", {
    data: { ...ref, kind: "donations" },
    headers: { Origin: origin },
  });
  expect((await paid.json()).status).toBe("demo_confirmed");
  expect(
    (
      await request.post("/api/payments/simulate", {
        data: { ...ref, kind: "donations" },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post("/api/payments/webhook", {
        data: { status: "paid" },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(503);
  const contact = await request.post("/api/contact", {
    data: {
      name: "Test Visitor",
      email: "demo@example.com",
      type: "volunteer",
      message: "I would like to learn about volunteering.",
      website: "",
    },
    headers: { Origin: origin },
  });
  expect(contact.status()).toBe(200);
  await page.goto("/admin");
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Good work, organized." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Contacts", exact: true }).click();
  await expect(page.getByText("Test Visitor · new")).toBeVisible();
  await page.getByRole("button", { name: "Pages", exact: true }).click();
  await page
    .getByRole("textbox", { name: "intro", exact: true })
    .fill("An edited introduction for a database persistence test.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Content saved");
  await page.reload();
  await page.getByRole("button", { name: "Pages", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "intro", exact: true }),
  ).toHaveValue("An edited introduction for a database persistence test.");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
});
