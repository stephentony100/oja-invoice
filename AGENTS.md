<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Oja Invoice

## One-liner

A seller types an order in a WhatsApp-style chat bubble ("5 cartons of
Indomie, 2 bags of rice, delivery 5,000"). AI parses it into a structured,
editable invoice. A Monnify payment link is generated and shared with the
buyer. On payment, a webhook confirms it, a receipt is auto-generated, and a
dashboard tracks invoices and running sales totals. Positioning: "Stripe for
WhatsApp businesses."

Built for the APIConf Lagos x Monnify Developer Challenge (4-day hackathon).

Real WhatsApp Business API integration is explicitly out of scope for the
hackathon — this is a standalone web app styled like a chat thread, with
native WhatsApp integration noted as post-hackathon roadmap.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS, package manager: pnpm
- Prisma ORM + SQLite (local file db)
- Anthropic Claude API for parsing raw order text into structured line items
- Monnify sandbox for payment link generation, webhooks, and payment status
- Vercel as the deploy target (webhooks require a public URL — see README)

## Data model (prisma/schema.prisma)

- **Seller** — id, name, phone (unique), createdAt; has many Invoices and
  PriceListItems.
- **Invoice** — id, sellerId, rawInputText, total (Int, smallest currency
  unit), status (PENDING/PAID/FAILED, default PENDING),
  monnifyPaymentLink (optional), monnifyReference (optional, unique),
  createdAt, paidAt (optional); has many LineItems.
- **LineItem** — id, invoiceId, name, quantity (Float), unit (optional),
  unitPrice (optional Int), lineTotal (optional Int).
- **PriceListItem** — id, sellerId, itemName, unitPrice, unit (optional),
  unique on [sellerId, itemName]. Stretch goal only (remembering a seller's
  per-item prices to speed up future parsing) — not used yet.

## Out of scope (for the hackathon)

- Real WhatsApp Business API integration
- Inventory tracking
- Multi-seller accounts / team access
- Multi-currency support
- Recurring invoices
- Credit / pay-later terms

## Phases

0. Scaffolding (current phase)
1. Prove Monnify payment-link + webhook, and Claude API parsing accuracy,
   in isolation — no UI dependency yet
2. Chat input UI + AI-parsed, editable invoice review screen
3. Payment flow: link generation, share screen, webhook handler, status
   polling fallback, auto-generated receipt
4. Dashboard + visual polish + empty/error states
5. Testing, demo video, README, submission

## Notes for later phases

- Payment links have no fixed expiry from the seller's perspective — an
  invoice stays Pending until paid, full stop, no overdue state anywhere in
  this product.
- However, Monnify's own payment links DO expire on Monnify's side
  (observed ~40 min in sandbox testing). This means in Phase 3, "Copy
  link" cannot assume the stored monnifyPaymentLink is always still valid —
  if a seller taps Copy link on an older Pending invoice, check whether the
  link has expired and silently regenerate a fresh one via Monnify's API if
  so, rather than surfacing Monnify's expiry mechanics to the seller. The
  seller should never see the word "expired" — this stays invisible
  plumbing.

---

When starting a new session mid-build, state which phase is in progress and
treat that phase's definition of done as the target — don't build ahead
into later phases' scope.
