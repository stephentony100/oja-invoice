# Nado

"Stripe for WhatsApp businesses" — a seller types an order in a chat-style
bubble, AI parses it into an editable invoice, a Monnify payment link gets
shared with the buyer, and payment is confirmed via webhook. Built for the
APIConf Lagos x Monnify Developer Challenge.

Live: https://oja-invoice.vercel.app

See [AGENTS.md](./AGENTS.md) for the full product one-liner, stack, data
model, out-of-scope list, build-phase history, and running notes.

## How it works

1. **Landing page → Get started** — a new seller lands on the marketing
   page and taps "Get started."
2. **Onboarding** — the seller sets a store name (and optional phone), which
   creates their account. Nado supports real multi-seller accounts: each
   seller gets their own id, stored in the browser (localStorage + a mirror
   cookie so server components can read it) — there is no shared demo
   account. First-time sellers see a brief, dismissible tour on their first
   visit to the chat feed; it never shows again after that.
3. **Chat feed** — the seller types an order in plain language (e.g. "5
   cartons of Indomie, 2 bags of rice, delivery 5,000"). Claude parses it
   into structured line items.
4. **Review** — the seller edits/confirms quantities and prices, then
   saves. This creates the invoice and requests a Monnify payment link.
5. **Share** — the seller copies the payment link or shares it straight to
   WhatsApp.
6. **Buyer pays** — via Monnify's hosted checkout (card, transfer, or
   USSD, sandbox mode for this build).
7. **Webhook confirms payment** — Nado's webhook handler marks the invoice
   Paid and generates a receipt; the buyer is redirected to a `/paid`
   confirmation page (with polling as a fallback if the webhook is slow).
8. **Dashboard** — the seller tracks running sales totals, pending vs. paid
   invoices, and full invoice history (a proper table at desktop width, a
   card feed on mobile).
9. **Logout** — tapping the avatar (top right, on chat/dashboard) opens a
   small menu with a "Log out" option that clears the local session and
   returns to the landing page.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the env template and fill in the keys:

   ```bash
   cp .env.example .env
   ```

   Keys needed:

   | Key | Where to get it |
   | --- | --- |
   | `DATABASE_URL` | Pooled Postgres connection string (Neon recommended — create a free project at neon.tech) |
   | `DIRECT_URL` | Neon's direct/unpooled connection string, used by Prisma for migrations |
   | `MONNIFY_API_KEY` | Monnify merchant dashboard, switched to sandbox/test mode |
   | `MONNIFY_SECRET_KEY` | Same Monnify dashboard, sandbox/test mode |
   | `MONNIFY_CONTRACT_CODE` | Same Monnify dashboard, sandbox/test mode |
   | `MONNIFY_BASE_URL` | Defaults to Monnify's sandbox API base URL, no action needed for local dev |
   | `ANTHROPIC_API_KEY` | Anthropic Console: https://console.anthropic.com/settings/keys |
   | `NEXT_PUBLIC_APP_URL` | Defaults to `http://localhost:3000` locally; update once deployed (see note below) |

3. Apply the existing database migrations (Prisma client is generated
   automatically on install via the `postinstall` script):

   ```bash
   pnpm exec prisma migrate deploy
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   App runs at http://localhost:3000.

## Deploying early matters

Monnify webhooks need to reach a public URL to confirm payments — they
can't call back to `localhost`. Deploy to Vercel early in the build (not
just at the end) and keep `NEXT_PUBLIC_APP_URL` pointed at that deployment,
so the payment/webhook flow can actually be tested end-to-end well before
the deadline.

## Known issues (submission state)

- **"Invoice" button on chat feed cards** — passes automated Playwright
  click testing (fires a real download of the correct unstamped document)
  but has been reported to not respond to a manual tap in a real browser
  session, likely a hydration-timing or click-interception issue headless
  testing didn't catch. Don't rely on it during a live demo — use "Copy
  payment link" (Pending invoices) or "View receipt" (Paid invoices)
  instead, both confirmed working. Revisit post-submission.
- **Monnify sandbox Transfer method** can intermittently fail with a
  generic "Transaction Failed" error unrelated to Nado's own code. Switch
  to Card payment if this happens rather than troubleshooting on the spot.
- **Seller session cookie is client-set and unsigned.** The IDOR vector
  where a seller passes another seller's id directly is closed (the server
  derives the seller identity from the session, never from client input),
  but a determined attacker who already knows another seller's exact
  session value could still set it manually. A signed/HttpOnly
  server-issued session is the proper fix — accepted as out-of-scope
  follow-up work for this submission's remaining time.
