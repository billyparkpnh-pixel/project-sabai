# Storage model

The app runs without external accounts using Node 24 SQLite. Hosted production can use Postgres via DATABASE_URL and the supplied migration. A single records table has (kind,id) primary key, JSON/JSONB payload and creation timestamp. Server validation restricts content and commerce inputs. Database credentials remain server-only; Supabase direct-browser roles have no grants or RLS policies.

- `content/site`: Page copy and hero image; Project (dates, activities, galleries, outcomes, milestones), Campaign (in-kind versus monetary, accepted items, status), Team/Member consent publication, Product (color, sizes/variants, price, cap, preorder, draft visibility, rights flag), impact, policies/settings and translations.
- `orders/<idempotency key>`: Customer, validated cart selections, immutable-at-creation line snapshots, merchandise subtotal, delivery fee and separate extra donation, USD demo amount, test provider/intent timestamps/expiry, opaque receipt token and fulfillment status. Test orders do not reserve inventory or confirm a preorder.
- `donations/<idempotency key>`: Donor optional identity/message, donation amount, intent status, test provider/expiry and opaque receipt token. Always separate from merchandise revenue.
- `contacts/<UUID>`: Enquiry type, subject/optional phone, message and review status; accessible only by admin.
- `audit/<UUID>`: Login/content/media changes, test intent creation/confirmation/cancellation and fulfillment/review changes.
- AdminUser: Supabase Auth identity; trusted app_metadata.role controls access. Local-only password/session mode exists for development without external credentials.

Real PaymentIntent/PaymentEvent/Refund/Reconciliation models and unique provider event IDs must be introduced with an authorized provider adapter and atomic settlement/reservation transactions. Current test intents are embedded in order/donation records; they are not an accounting ledger or certified bank integration. Immutable financial audit retention, tax receipts, mail delivery and operational data retention require organization/provider decisions before launch.
