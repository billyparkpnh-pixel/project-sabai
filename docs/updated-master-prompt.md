# CODEX MASTER BUILD PROMPT — PROJECT SA’BAI CAMBODIA (UPDATED WITH ALL PROVIDED IMAGES)

You are acting as an experienced full-stack web engineer, accessible UI/UX designer, ecommerce developer, and creative director. Implement a working, high-quality, mobile-first website and admin system for a proposed **Project Sa’Bai Cambodia** website prototype.

IMPORTANT: This project is not yet an officially approved public fundraising site. Treat it as a private prototype until the organization confirms permission for use of its identity, images, products, fundraising claims, bank account and customer data. Do not publish or accept real money without that authorization.

## A. FIRST ACTION: INSPECT, EXTRACT, AND USE THIS PACKAGE

The user supplied the ZIP `project_sabai_codex_complete_v2.zip`. It contains:
- This `prompts/CODEX_MASTER_PROMPT.md` file
- A short `prompts/CODEX_QUICK_MESSAGE.txt` you can use if asked what to do
- `assets/branding/` with two organization scrapbook/branding/team collages
- `assets/outreach/` with a Takéo Province reconnaissance-trip screenshot
- `assets/donation-posters/` with the book-donation campaign poster and its *unverified-purpose* QR
- `assets/merchandise/` with the actual uploaded T-shirt design mockups
- `ASSET_MANIFEST.csv` listing all 15 source uploads (including a re-uploaded Night Shift Club mockup)

1. Inspect the repository `billyparkpnh-pixel/project-sabai` and determine its existing structure/framework and whether code is already present. Do not destroy unrelated files.
2. Find this ZIP and extract it. Review the source images and `ASSET_MANIFEST.csv`. Do not claim access to files if they are not present in your environment: ask only for missing files if necessary.
3. Preserve the original image files unmodified as a reference collection, preferably `/public/reference-assets/` for mockup-only assets or a secure asset area until usage permissions are confirmed.
4. Build the entire site from the specifications below. Do not merely write a plan, display a static screenshot, or stop after scaffolding.
5. Use ONLY the provided product reference photos for the initial catalog, not generic stock T-shirts. Each supplied T-shirt image shows front and back in a *single* combined graphic. You may show that entire graphic, zoom it, or derive non-destructive preview crops if accurate; never invent nonexistent camera angles, colors, details, logos, or separate print artworks.

## B. REQUIRED BRANDING AND LOOK

Use the organization's own scrapbook-style identity, based on the supplied images:
- Deep navy blue: #233D65
- Sunshine yellow: #FFE365
- Burgundy: #79323D
- Warm cream/off-white: #F7F5EF
- Secondary accents as appropriate from the supplied photos
- Checkered fabric patches, notebook and lined paper textures, Polaroid photo treatments, spiral binding, little sun doodles, tape collage accents
- Bold, distinctive headings, spacious readable body text, accessible contrast
- Youthful, sincere, community-focused, never a generic hospital website

Use scrapbook elements as selective accents around clean, modern layouts. Ensure desktop, tablet and mobile look excellent, including a carefully designed mobile navigation. Smooth transitions are fine, but support prefers-reduced-motion and avoid heavy animations.

At top: logo/wordmark, Home, About Us, Projects & Impact, Shop, Donate, Contact, cart count, language selector EN/ខ្មែរ and prominent Donate button. A clear footer should link all pages plus verified official socials. Include truthful policy pages for shipping/preorders, privacy, returns/refunds and contact. Do not invent operational policy; use admin-required placeholders and keep transactions disabled if essential policy is missing.

## C. PAGES AND CONTENT

### 1. HOME
- Engaging hero with approved organization imagery when authorized; otherwise explicit demo placeholder with matching style.
- Main slogan: **One Goal, One Heart, One SA’BAI!**
- Main heading suggestion: **Together, We Make a Difference.**
- Two primary actions: See Our Projects and Support Our Mission.
- Brief About/Mission excerpt. The supplied reference identifies the initiative as established in 2006 and describes community healthcare/health education across Cambodia; verify details with the organization before public launch.
- Featured past/current projects (editable), impact metrics from verified sources only, merchandise highlights with $10 price where applicable, donation callouts, latest news/campaigns, volunteer and partner contact.
- Build distinct visual zones that flow naturally rather than one long repeated grid.

### 2. ABOUT US
- Organization overview, mission, history, values, approved partners, timeline and committees.
- Meet Our Team using the scrapbook references. Include Clinic Heads, Health Education, Public Relations, Pharm Logs and room for additional teams.
- Names, faces, roles and biographies editable in admin, published only with consent.

### 3. PROJECTS & IMPACT — ONE COMBINED PAGE
- Filterable project cards: Past, Current and Upcoming; filter by year, location and project type.
- Each project route supports title, date, place/province, purpose, activities, gallery, video links, verified outcomes, photos, testimonials only with permission, and a Donate CTA.
- Include a separately marked field visit / reconnaissance category: the supplied Takéo screenshot shows permit/reconnaissance work, NOT proof of a completed medical clinic.
- Add verified impact counters, project milestones, transparent impact descriptions, photo galleries and an admin-managed campaign card grid.
- No fake impact figures, no fabricated beneficiaries, no unsupported claims.

### 4. CONTACT
- Contact form for General, Volunteer, Partner, Merchandise, Donation, Other. Fields: name, email, subject, message, optional phone; spam protection and validation.
- Verified social links, including TikTok @projectsabai_cambodia.
- A contact email appears on one poster, but do not automatically treat it as a verified current organizational contact; make admin-confirmed.

### 5. CAMPAIGNS / BOOK DONATIONS
The provided campaign poster is titled BOOKS DONATION, requesting notebooks, story books, coloring books, picture books and other children's reading materials in support of a library refurbishment in Takéo. The poster says May 4–9 but its year/current status is NOT verified. Do not mark this as an active campaign by default.
- Create a project/campaign content type supporting physical in-kind donations (such as books) separately from money donations.
- Show accepted item categories, dates/status, instructions, point of contact and images only when authorized.
- If this poster's QR links to a form or social page, treat it as that type of QR, NOT automatically as an ABA/KHQR payment QR.
- Do not extract its embedded QR and present it as a verified payment recipient. The organization must supply a current approved payment QR and authorization.
- Admin can enable/disable campaigns, mark outdated ones as Past, and update donation methods.

## D. MERCHANDISE SHOP — ALL PROVIDED T-SHIRTS

**Every T-shirt in the initial catalog is priced at $10 USD per shirt as specified by the user.** Set this as the editable default price in the demo catalog, with currency clearly displayed. All initial shirts are **PRE-ORDER**, not claimed to be in stock. Do not invent inventory, shipping fees, sizes or pickup locations.

Seed the following **TEN UNIQUE merchandise products**, mapping to the original uploaded images:
1. **Conquering Pharmacy Care** — `assets/merchandise/01-conquering-pharmacy-care.webp` — white, small green characters front; pharmacy laptop character on back.
2. **The Night Shift Club** — `assets/merchandise/02-the-night-shift-club-original.webp` — white, 'Powered by C8H10N4O2' on chest and a medical character on back. An identical/resubmitted reference exists at `assets/merchandise/05-the-night-shift-club-resubmitted.webp`. Create ONE product, not two.
3. **Tiramisu** — `assets/merchandise/03-tiramisu.webp` — cream/white shirt, tiramisu illustration front/back.
4. **Lazy Duck Club** — `assets/merchandise/04-lazy-duck-club.webp` — cream/white shirt, humorous duck graphics on front/back.
5. **Oil Lamp Chest** — `assets/merchandise/06-oil-lamp-chest.webp` — cream/white nursing/lamp themed design.
6. **Flora Mentalis** — `assets/merchandise/07-flora-mentalis.webp` — navy shirt, human-head/floral illustration on back.
7. **Molar Radix** — `assets/merchandise/08-molar-radix.webp` — white shirt, cartoon molar/skateboard back.
8. **Snoopy Medical Illustration** — `assets/merchandise/09-snoopy-medical-illustration.webp` — white shirt with Snoopy medical character art. **KEEP DRAFT/NOT FOR PUBLIC SALE until the organization confirms merchandising rights/licensing for this copyrighted character and artwork.**
9. **Brace Yourself** — `assets/merchandise/10-brace-yourself.webp` — royal blue shirt, medical/dental x-ray-themed back.
10. **The Dose Makes the Poison** — `assets/merchandise/11-the-dose-makes-the-poison.webp` — cream/white shirt, dark green pharmacy/toxicology symbol.

The original product mockups must be shown unchanged and legibly. The website may use product cards with hover effect to switch between front/back portions only if the extraction is accurate; product detail page must include full original combined graphic for trust and fidelity.

### Shop requirements
- Product catalog with filters/sorting, available designs, detailed product pages, image gallery and zoom, price **$10 USD**, labeled **Pre-order**, sizes only after admin config, quantities and configurable inventory/preorder caps.
- Cart: add, remove, change quantity; persist cart client-side safely without pretending it is an order; show live totals.
- Checkout: name, verified-format email/phone, province/city, address or pickup selection, optional instructions, selected size/quantity, itemized products and optional extra donation. Shipping/pickup fees are admin-configured and zero must not be assumed without confirmation.
- Preorder terms displayed before payment: estimated fulfillment window (admin set), refund/cancellation policy (admin set), pickup/delivery information, and contact.
- Checkout records an order server-side. Statuses: draft, awaiting payment, paid/confirmed preorder, preparing, ready for pickup, shipped, fulfilled, cancelled, refunded as appropriate. Never assert pre-order confirmation before payment is verified.
- Optional add-on donation at checkout, with its amount tracked separately from product sale revenue.
- Build a clear order summary showing quantity × $10. Sample: 2 shirts = $20 before any configured shipping or extra donation.
- Email confirmation/receipt after actual payment verification, if mail provider configured; otherwise show truthful in-app status and no fake sending claims.

## E. DONATE + KHQR / ABA BANK APP PAYMENT

Build TWO clearly distinct financial payment paths using the same secure authorized provider integration:
1. Direct monetary donation with suggested $5 / $10 / $25 / $50 and custom USD amount.
2. Pre-order payment for $10 shirt purchases, plus optional extra donation.

**The user specifically wants KHQR and a convenient flow that can open ABA Mobile when supported.** Build the following professionally and safely:

1. Require approval and official account details supplied by Project Sa’Bai; payments must go to the organization's authorized account, never the developer's private account or an account copied from an unverified screenshot.
2. Choose an authorized ABA Bank merchant/PayWay or official Bakong/KHQR integration supported by the actual payee; do not assume approval, credentials or every payment method is available.
3. After the user selects donation amount or completes pre-order checkout, create a server-side payment intent for the exact order/donation amount, currency, payee and unique order reference.
4. Generate an authorized **dynamic** KHQR for the amount when the provider permits, or another provider-supported workflow. Render the QR clearly with merchant name, amount, expiration and instructions.
5. **On mobile**, if the authorized provider returns an official app-deep-link or universal/short link, show **Open ABA Mobile / Open Banking App** and use the returned URL unchanged. If no approved deeplink is supplied, omit the button rather than inventing an `abamobilebank://` string or assuming it will work. Provide QR copy/save/share as fallback only if permitted.
6. **On desktop**, prominently show **Scan with ABA Mobile or another compatible KHQR bank app** and a reasonably sized scannable QR. Also display any approved payment reference.
7. Support safe graceful fallback if app is not installed, link cannot open, QR expired, user cancels, connection fails, or currency unsupported.
8. Payment states: awaiting payment, processing, confirmed, expired, cancelled, failed. Verify server-side via official authenticated provider callback/webhook or documented transaction-status API. Validate signature where applicable, payee, amount, currency, transaction reference and replay/idempotency, not just a success redirect.
9. Never mark paid just because the visitor clicks 'I have paid', scans a QR, opens ABA, uploads a screenshot, or returns to the site.
10. Issue an order number and receipt only after trusted verification. Reconcile payment records and protect personal data.
11. If the merchant account/API is not ready, implement a non-payable TEST/DEMO mode with clear test badges on every QR/payment step. Never generate a fake live ABA pay link or accept real card/banking credentials in the site.
12. If the organization chooses a **static** ABA KHQR, show it only after explicit verification of the payee and explain that automatic payment detection requires bank-supported reconciliation; do not fake dynamic-QR status checking for static QR. A screenshot of a generic book donation poster is NOT equivalent to proof of a payment account.
13. Keep secrets in server-side environment variables; include `.env.example`, provider interface, clear onboarding instructions, webhook and status tests.

Official provider references to consult when implementing (verify up-to-date docs and merchant eligibility first):
- ABA payment collection and KHQR: https://www.ababank.com/en/payment-collection/
- ABA QR information: https://www.ababank.com/en/aba-mobile-app/aba-id/
- National Bank of Cambodia Bakong Open API (dynamic QR deeplink and status docs): https://sit-api-bakong.nbc.gov.kh/document
- ABA PayWay sandbox documentation (only use a deeplink returned by the authorized provider): https://checkout-sandbox.payway.com.kh/plugins/payway-v2-sandbox.pdf

## F. ADMIN DASHBOARD AND DATA MODEL

Secure dashboard with real admin authentication, role-based access, CSRF/session safeguards as appropriate and audit logs. Provide CRUD for:
- Page copy, banners and hero media
- Project case studies, event/campaign dates/status, impact stats and public sharing approval
- Team/committee profiles with consent status
- Merchandise titles, photos, visibility, $10 price default, variations, preorder caps/availability and fulfillment terms
- Preorders/orders (customer details secured), statuses, delivery/pickup, optional donation entries
- Donation/payment records with verified transaction identifiers, status and provider; refund/reconciliation records
- Shipping/delivery fees and settings; official organization contact details
- Contact messages and volunteer inquiries
- EN/ខ្មែរ translation content and approved socials

Data models should distinguish: Project, Campaign, Member, Product, ProductVariant, Cart/Order/OrderItem, Donation, PaymentIntent/PaymentEvent, ContactMessage, SiteSettings, AdminUser and audit logs. Do NOT store patient records or confidential medical case details.

## G. TECHNICAL IMPLEMENTATION

- Inspect existing files. If no usable app exists, scaffold Next.js + TypeScript + Tailwind CSS at root, using accessible components and a clean folder structure.
- Appropriate backend database/auth (for example Supabase/Postgres) with migrations, schema, permissions, data validation and separate server/client keys. Do not hard-code credentials or use placeholder credentials in production.
- Components should be reusable and pages responsive.
- Clean SEO metadata, OpenGraph preview, accessible language controls, responsive assets, alt text, keyboard navigation and reduced-motion support.
- Two-language-ready layout English and Khmer, with translations stored in locale files; do not generate false official translations if none have been reviewed.
- Add safe handling for image copyright and consent. Important: supplied mockups can contain copyrighted character art; treat these as user-provided references pending legal authorization for public ecommerce use.
- Avoid publishing private names/contact details captured in images without explicit organizational consent.
- Secure admin routes, rate limit sensitive endpoints, use server-side price totals and stock/preorder validation; prevent duplicate order creation/payment mismatches.
- Do not rely on only localStorage for persistent orders/donations.
- Include unit/integration tests for cart arithmetic ($10/shirt), pre-order statuses, donation separation, duplicate callbacks, payment reference matching and admin access.
- Provide `.env.example`, README setup commands, database migrations, seed data and provider integration guides.
- Do not claim to have tested a live integration unless credentials and bank verification were actually available.

## H. DELIVERY AND DEFINITION OF DONE

1. Inspect repository + extracted image package; report where files actually are.
2. Scaffold/fix project while preserving unrelated files.
3. Build and style Home, About, Projects & Impact, Shop, Donate, Contact and admin screens.
4. Seed 10 UNIQUE T-shirt entries at $10 USD each, marked Pre-order; one Night Shift listing only despite duplicate image.
5. Implement cart and pre-order backend with proper shipping/pickup settings.
6. Integrate KHQR/ABA via a safe provider adapter and fully labeled demo mode; implement an 'Open ABA Mobile' option *only* when the official provider actually returns the supported link.
7. Add the book donation poster as a historical/unverified campaign draft, never default to a live bank payment target from its QR.
8. Add admin editing for merchandise, projects, donations, photos and content.
9. Run install, typecheck, lint, build and relevant tests; fix failures.
10. Commit changes on an appropriate Git branch, describe exactly what was completed, what is demo-only and what requires merchant credentials, permission, product size/shipping info or verification.
11. Explain how to preview locally and deploy only after the organization authorizes publication. Do not publish or charge real users without authorization.

FINAL EXPECTATION: a polished Project Sa’Bai website with authentic scrapbook identity, useful project stories and impact, a real $10-per-shirt pre-order catalog, transparent donations, and a payment system designed for approved KHQR/ABA integration. Code and UX must be real; actual financial collection remains disabled until authorized and verified.
