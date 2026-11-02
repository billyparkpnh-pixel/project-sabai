# Project Sa’Bai

A responsive Next.js 16 / React 19 / TypeScript / Tailwind website prototype using the supplied navy, sunshine yellow, burgundy and cream scrapbook identity. **Not officially approved; no real payments or public deployment.**

## Preview locally

Requires Node.js **24+** and npm. Use the existing checkout; no worktree is necessary.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On your own machine, open `http://localhost:3000`. For a remote development environment, use its port 3000 forwarding if available. The onboarding chat itself does not provide a public preview URL. No public deployment is created. To preview on another machine, copy this checkout or push the committed branch to GitHub when you choose, then clone it.

Set a strong unique `ADMIN_PASSWORD` and random `SESSION_SECRET` in `.env.local` to use `/admin` locally. Email can be blank for local password authentication. **No default account is shipped; local password auth is disabled in production.** Data persists in ignored `.data/sabai.sqlite`. The original `sabai` file is untouched.

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm start
```

Browser tests use a separate database and random per-run admin password. Install Chromium with `npx playwright install chromium` if necessary; optionally set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. A system Chromium is detected on this cloud machine.

## Pages and working features

- Home, About, Projects & Impact, filtered project detail routes, ten-product shop, product zoom/details, persistent browser cart, test checkout, Donate/KHQR test experience, receipt/status page, Contact, protected Admin, and truthful privacy/shipping/returns policy pages.
- Ten unique **$10 USD pre-order** designs, with one Night Shift listing. Two original combined front/back mockups are supplied; eight artwork placeholders are explicitly labeled. Sizes start empty, stock/preorder caps and shipping/pickup fees start unconfigured. Configure approved sizes through admin before adding items to a test cart. No stock is invented or reserved.
- Server-side product, size, quantity, cap and money validation; price snapshots; separately accounted merchandise subtotal, fees and optional donations. Test records are persistent and idempotent, not just localStorage. Live checkout stays disabled regardless of configuration.
- Non-payable KHQR placeholder, 15-minute test intent expiry, status polling, test cancellation/simulation and printable **test record**, never a real receipt or payment proof. There is no ABA app button because no authorized provider has returned an official link.
- Contact validation, honeypot, throttling, database storage and admin review. Messages are not emailed. No patient information should be entered.
- Admin editing for page copy and hero media, projects/dates/activities/galleries/milestones, featured content, campaigns, products/prices/colors/sizes/caps, teams, verified impact, shipping/pickup/preorder/policy settings and dictionaries. Image upload/library, record review, fulfillment status transitions, audit log and analytics excluding test money. Admin cannot manually mark payment paid.
- Historical/unverified **in-kind** book campaign draft, separate from monetary donations. No poster was supplied, its year/current status is unverified, and no QR/account was extracted or inferred.
- English/Khmer navigation and hero dictionaries, editable with English fallback. Full body translation still needs human review. System fonts support Khmer when available; install Noto Sans Khmer on devices lacking it.

`stock` is the optional per-order inventory/preorder cap used for validation in this test system. Aggregate reservation/decrement across concurrent real orders is intentionally not implemented because live commerce is disabled. See the payment guide before enabling real commerce.

## Hosted Postgres and production admin

1. Create an authorized Supabase project (or hosted PostgreSQL) and apply `migrations/001_records.sql`. For standalone Postgres without Supabase roles, omit the two Supabase-role revocations and use a restricted server database role.
2. Set server-only `DATABASE_URL` to a TLS database/pooler URL. Certificate verification remains enabled. Data is stored as validated JSONB records. Direct browser access is denied by table privileges and RLS; no public policies are installed. Back up data and define a retention/deletion policy for customer and enquiry details.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Create team accounts using Supabase Auth and assign trusted **app_metadata.role = admin** through its dashboard/admin API. User-editable metadata is never trusted. The server validates Supabase tokens on each protected request; cookies are HttpOnly, SameSite Strict and Secure in production. Sessions expire after one hour; sign in again.
4. Configure Supabase recovery email templates and allow the authorized origin’s `/admin/reset` redirect. The recovery page exchanges the email's bearer session for a server-side password update after admin-role validation. No service-role key goes to the client. Hosted authentication, mail delivery and database access require your accounts and have not been verified in this environment.
5. Use a persistent volume for `references/` and a long-lived Node server for uploaded images. The five original files must be included on that volume. Uploads require admin access, are capped at 5 MB, signature-checked PNG/JPEG/WebP, and use random filenames. No SVG/arbitrary uploads. A storage adapter is required before switching to ephemeral serverless media storage.
6. Add a shared edge/WAF rate limit for public multi-instance deployment; the built-in anti-spam/login throttle is per process. Configure the reverse proxy to supply trusted Host/IP headers and cap request bodies. Set `APP_ORIGIN` to the canonical HTTPS origin for an additional origin check.

**Never deploy SQLite/writable media to ephemeral Vercel functions.** A suitable production target is Node 24 on a container/VM with persistent media plus hosted Postgres/Supabase Auth. Run `npm ci && npm run build`, then `npm start` behind HTTPS. Expose port 3000 through the proxy only after publication is authorized. GitHub Actions runs typecheck, lint, unit tests and build. No deployment or push happens automatically.

## Media approval and references

All five supplied originals are preserved byte-for-byte in `references/`, outside `public/`, and served through a gated route. Development shows clearly labeled internal references. Production hides draft products and denies unapproved media by default. Keep `MEDIA_APPROVED=false` until organization, photographer, relevant people and artwork permissions are confirmed.

For an **access-controlled internal review only**, set `INTERNAL_PREVIEW=true` before starting production mode. Never enable it on an unapproved public URL. Snoopy has an additional `rightsRequired` flag; even publishing its record does not expose it publicly while this flag remains true. Clear only with confirmed licensing.

The Takéo image documents reconnaissance, not delivered treatment. Hero/team collages are shown intact as original internal reference layouts, not falsely presented as separate high-resolution photographs. Merchandise images retain their full combined front/back graphics. Additional approved image filenames can be set in admin, including independently uploaded front/back views.

`docs/website-requirements.txt`, `docs/package-readme.txt`, and `docs/updated-master-prompt.md` preserve the supplied briefs. The user confirmed applying the revised ten-product brief with placeholders. Its referenced **project_sabai_codex_complete_v2.zip** was not attached; eight unique shirt mockups and the book-donation poster remain missing. `docs/asset-manifest.csv` records exactly which images exist.

History (including 2006), team names/portraits, partner claims, impact figures, operational policies and contact/social ownership require verification. The TikTok handle is supplied by the brief and labeled pending verification. No organizational addresses, emails, phone numbers, testimonials or impact numbers are invented.

## Payments remain test-only

`lib/payments.ts` defines the authorized-provider contract and verification matching helper. No real provider is registered and `/api/payments/webhook` returns 503. No live merchant credentials, payable QR, banking deeplink or real collection exist. Clicking a simulation, uploading a screenshot or editing fulfillment cannot mark real payments paid. Demo confirmation uses `demo_confirmed`, not `paid`; test totals never count as real revenue/donations. USD is a demo denomination until a provider confirms support.

Read `docs/payments.md` for the remaining authorized provider integration, signature verification, transaction matching, stock reservations, reconciliation and receipt work. Environment variables alone cannot activate real payments. Use fictitious details when reviewing test flows; test records can contain personal information.

## Shared QR, separate donation and shop sections

The homepage now shows all ten designs. Donations stay at `/donate`; T-shirt purchases stay in `/shop`, `/cart` and `/checkout`. No merchandise grid is embedded in Donate. Both payment panels reference **one cropped QR image** through `settings.sharedQrImage`, without embedding the donation poster.

In **Admin → Media → One QR, two separate sections**, upload the original poster or a clear QR file. The server locates the code, copies its original pixels into a PNG with a white quiet zone, and decodes the result again to check identical content. It does not redraw the code, follow its URL or treat a link/EMV prefix as verified merchant authorization. Cropped QR references remain internal and are denied to public production requests even when general media approval is enabled. Real payments stay disabled.

In **Admin → Products**, each product has a direct original-mockup upload control. Save after uploading to assign the image. The latest chat includes inline images for Flora Mentalis, Snoopy Medical Illustration, Molar Radix, Brace Yourself, Conquering Pharmacy Care and the book poster. These inline images are visible in conversation but have no downloadable file IDs/local paths in the current tool context. Their actual source files are still needed to save those new images and crop the supplied QR. The crop feature has been tested using a synthetic, explicitly non-payment QR, not the user's poster.
