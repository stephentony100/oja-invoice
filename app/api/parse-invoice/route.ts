import Anthropic from "@anthropic-ai/sdk";
import { parseOrderText } from "@/lib/parser";

const FRIENDLY_PARSE_ERROR = "Couldn't understand that order — try rephrasing it.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = body?.text;

  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Missing order text" }, { status: 400 });
  }
  if (text.length > 2000) {
    return Response.json({ error: "Order text is too long" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const parsed = await parseOrderText(client, text.trim());
    if (!parsed.items || parsed.items.length === 0) {
      return Response.json({ error: FRIENDLY_PARSE_ERROR }, { status: 422 });
    }
    return Response.json(parsed);
  } catch (error) {
    // Never surface raw SDK/API error internals to the seller — log for
    // debugging, show a friendly message they can act on.
    console.error("[parse-invoice] failed:", error);
    return Response.json({ error: FRIENDLY_PARSE_ERROR }, { status: 500 });
  }
}
