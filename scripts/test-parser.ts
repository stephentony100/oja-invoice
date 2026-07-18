// Phase 1 proof-of-concept: exercises the Claude API's ability to parse raw,
// informal order text into structured line items. Standalone script, not
// wired into the chat UI yet — that's Phase 2. Run with:
//   pnpm exec tsx scripts/test-parser.ts

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { parseOrderText } from "../lib/parser";

const TEST_ORDERS: string[] = [
  "5 cartons of Indomie, 2 bags of rice, delivery 5,000",
  "3 crates eggs 2500 each, transport 1k",
  "1 bag rice 45k, 2 indomie carton",
  "2 bottles groundnut oil 3500, 1 bag beans",
  "10 sachets pure water 50 each",
  "small rice for 3, big rice for 2, delivery 2k",
  "1 carton milo, half bag sugar 8000",
  "5kg tomatoes 4000, pepper 1500, onions",
  "2 gallons palm oil 6000 each plus delivery",
  "1 bag cement 8500",
  "3 packs spaghetti 500 each, 2 tin tomato paste",
  "assorted drinks worth 15000, cups 1000",
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY in environment.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  let fullyResolved = 0;
  let missingPrices = 0;
  const flagged: string[] = [];

  for (let i = 0; i < TEST_ORDERS.length; i++) {
    const rawInput = TEST_ORDERS[i];
    console.log(`\n${"=".repeat(70)}`);
    console.log(`[${i + 1}/${TEST_ORDERS.length}] RAW INPUT: ${rawInput}`);
    console.log("-".repeat(70));

    try {
      const parsed = await parseOrderText(client, rawInput);
      console.log("PARSED:", JSON.stringify(parsed, null, 2));

      if (parsed.subtotal_known) {
        fullyResolved++;
      }
      if (parsed.items_missing_price.length > 0) {
        missingPrices++;
      }

      // Heuristic sanity flags — not exhaustive, just surfaces obvious misses.
      if (parsed.items.length === 0) {
        flagged.push(`#${i + 1}: parsed zero items`);
      }
      for (const item of parsed.items) {
        if (item.quantity <= 0) {
          flagged.push(`#${i + 1}: "${item.name}" has non-positive quantity`);
        }
        if (
          item.unit_price !== null &&
          item.quantity !== null &&
          item.line_total !== null &&
          Math.abs(item.unit_price * item.quantity - item.line_total) > 1
        ) {
          flagged.push(
            `#${i + 1}: "${item.name}" line_total doesn't match unit_price * quantity`
          );
        }
      }
    } catch (error) {
      console.error("ERROR:", error instanceof Error ? error.message : error);
      flagged.push(
        `#${i + 1}: threw an error — ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("ACCURACY SUMMARY");
  console.log("=".repeat(70));
  console.log(
    `Fully resolved to a total: ${fullyResolved}/${TEST_ORDERS.length}`
  );
  console.log(
    `Left items with missing prices: ${missingPrices}/${TEST_ORDERS.length}`
  );
  if (flagged.length > 0) {
    console.log(`\nFlagged as possibly wrong (${flagged.length}):`);
    for (const f of flagged) console.log(`  - ${f}`);
  } else {
    console.log("\nNo automatic flags raised — manually review the parses above.");
  }
}

main();
