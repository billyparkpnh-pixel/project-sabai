# Current-instance validation

- Clean frozen-lockfile installation: `npm ci --no-audit --no-fund` passed.
- `npm run lint` passed.
- `npm run typecheck` passed; production build also completed its TypeScript check.
- `npm test`: 11 unit tests passed, none skipped.
- `npm run test:e2e`: 2 Chromium integration scenarios passed, none skipped. Covers desktop/mobile layout bounds and navigation, all ten catalog entries/search and missing-artwork placeholders, project gallery rendering, modal keyboard dismissal, cart persistence, validated test checkout and donation-separated totals, demo payment confirmation, unauthenticated/CSRF denial, idempotency conflict handling, receipt authorization, contact persistence and admin content persistence/logout.
- `npm run build` passed with all routes compiled.
- Production server functional requests: Home/About/Projects/Shop/Donate/Contact/policy pages respond; unapproved media returns 403; admin API returns 401; draft catalog and campaign data are omitted from public content; live webhook returns 503. Unapproved product routes render the not-found page without product content. Next.js streaming may retain HTTP 200 for a streamed not-found page.
- All five original image checksums match the supplied extracted files.
- Development server started on port 3000 and final catalog/homepage requests passed. Ten $10 designs appear in internal development preview, with official sizes left unconfigured.

These checks validate the current local SQLite/development admin and production gating paths. Hosted Postgres/Supabase accounts, password recovery email delivery, a real KHQR provider, actual banking app links, public deployment and a restored fresh cloud task were not tested. No real collection, GitHub push or public launch occurred.
