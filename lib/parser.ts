import Anthropic from "@anthropic-ai/sdk";

export const PARSER_SYSTEM_PROMPT = `You parse informal Nigerian seller order text into structured invoice line items.

Input is a single raw message a seller typed describing an order (items, quantities, prices, sometimes delivery). Prices may be written as "5k" (5,000), "45k" (45,000), "1k" (1,000), or plain numbers. Quantities may be words ("half bag") or numbers. Not every item has a stated price or quantity unit.

Respond with ONLY a JSON object matching this exact shape, no prose:

{
  "items": [
    {
      "name": string,           // the item name, cleaned up (e.g. "Indomie", "rice")
      "quantity": number,       // best-guess numeric quantity; use 1 if not stated
      "unit": string | null,    // e.g. "carton", "bag", "crate", "sachet", "bottle", "gallon", "pack", "tin"; null if not applicable
      "unit_price": number | null,   // price per unit in naira; null if not stated
      "line_total": number | null    // unit_price * quantity if computable, or a stated flat price for the line; null if unknown
    }
  ],
  "subtotal_known": boolean,       // true only if every item has a computable line_total
  "items_missing_price": string[]  // names of items with no price information at all
}

Rules:
- "delivery" or "transport" charges are their own line item with name "Delivery" or "Transport", quantity 1, unit null.
- If a price applies to multiple items jointly (e.g. "2 indomie carton" with no price after an earlier priced item), leave unit_price and line_total null for that item and add it to items_missing_price.
- Never invent a price that was not stated or cannot be derived from the text.
- "k" suffix means multiply by 1000 (e.g. "8k" = 8000, "45k" = 45000).
- Output must be valid JSON and nothing else.`;

export interface ParsedLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unit_price: number | null;
  line_total: number | null;
}

export interface ParsedInvoice {
  items: ParsedLineItem[];
  subtotal_known: boolean;
  items_missing_price: string[];
}

export const PARSER_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "number" },
          unit: { type: ["string", "null"] },
          unit_price: { type: ["number", "null"] },
          line_total: { type: ["number", "null"] },
        },
        required: ["name", "quantity", "unit", "unit_price", "line_total"],
        additionalProperties: false,
      },
    },
    subtotal_known: { type: "boolean" },
    items_missing_price: { type: "array", items: { type: "string" } },
  },
  required: ["items", "subtotal_known", "items_missing_price"],
  additionalProperties: false,
} as const;

export async function parseOrderText(
  client: Anthropic,
  rawInput: string
): Promise<ParsedInvoice> {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: PARSER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawInput }],
    output_config: {
      format: { type: "json_schema", schema: PARSER_OUTPUT_SCHEMA },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in response");
  }

  return JSON.parse(textBlock.text) as ParsedInvoice;
}
