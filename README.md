# Oja Invoice

"Stripe for WhatsApp businesses" — a seller types an order in a chat-style
bubble, AI parses it into an editable invoice, a Monnify payment link gets
shared with the buyer, and payment is confirmed via webhook. Built for the
APIConf Lagos x Monnify Developer Challenge.

See [AGENTS.md](./AGENTS.md) for the full product one-liner, stack, data
model, out-of-scope list, and current build phase.

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
   | `DATABASE_URL` | Already set to `file:./dev.db` (local SQLite), no action needed |
   | `MONNIFY_API_KEY` | Monnify merchant dashboard, switched to sandbox/test mode |
   | `MONNIFY_SECRET_KEY` | Same Monnify dashboard, sandbox/test mode |
   | `MONNIFY_CONTRACT_CODE` | Same Monnify dashboard, sandbox/test mode |
   | `MONNIFY_BASE_URL` | Defaults to Monnify's sandbox API base URL, no action needed for local dev |
   | `ANTHROPIC_API_KEY` | Anthropic Console: https://console.anthropic.com/settings/keys |
   | `NEXT_PUBLIC_APP_URL` | Defaults to `http://localhost:3000` locally; update once deployed (see note below) |

3. Run the initial database migration (creates the SQLite file and Prisma
   client):

   ```bash
   pnpm prisma migrate dev
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
