/**
 * @fileoverview POST /api/nudge — Hybrid AI carbon footprint analysis endpoint.
 *
 * Architecture:
 *  Step 1 — Azure OpenAI (`gpt-4.1-mini`) classifies the user's natural language habit
 *            into a structured key + quantity + frequency JSON object.
 *  Step 2 — TypeScript executes 100% deterministic math using EMISSION_FACTORS constants.
 *
 * This separation guarantees scientifically accurate, non-hallucinated results.
 *
 * @module nudge/route
 */
import { NextResponse } from "next/server";
import { sanitizeHabitInput } from "@/utils/sanitizer";
import { EMISSION_FACTORS } from "@/utils/emissionFactors";
import { ruleBasedFallback, type NudgeResult } from "@/utils/fallback";

const AZURE_MODEL = "gpt-4.1-mini";

/** Shape of the Azure OpenAI Responses API payload. */
interface AzureResponse {
  output: { content: { type: string; text: string }[] }[];
}

/** Strict JSON schema the AI classifier must return. */
export interface AIExtraction {
  /** Key matching a record in EMISSION_FACTORS. */
  habitKey: string;
  /** Exact numerical quantity mentioned by the user. */
  quantity: number;
  /** Annualised frequency: 365=daily, 52=weekly, 12=monthly, 1=once. */
  frequencyPerYear: number;
  /** Personalised improvement suggestion. */
  nudge: string;
}

/**
 * Builds the system prompt for the AI classifier using available emission keys.
 *
 * @returns The formatted system prompt string.
 */
function buildClassifierPrompt(): string {
  const keys = Object.keys(EMISSION_FACTORS).join(", ");
  return `You are a habit classifier. Your ONLY job is to classify a user's habit into a structured JSON object.
Available habitKeys: ${keys}
Rules:
- habitKey: pick the BEST matching key from the list above.
- quantity: extract the EXACT number the user mentions. If no number, use 1.
- frequencyPerYear: 365 if daily/everyday, 52 if weekly, 12 if monthly, 1 if once or one-off purchase.
- nudge: one personalized sentence that mentions the exact quantity and suggests a realistic improvement.
Respond ONLY with valid JSON: {"habitKey":"<key>","quantity":<number>,"frequencyPerYear":<number>,"nudge":"<string>"}`;
}

/**
 * Calls the Azure OpenAI Responses API and returns a structured NudgeResult.
 *
 * @param habit - Sanitized free-text habit string from the user.
 * @returns Resolved NudgeResult with accurate deterministic CO2 math.
 * @throws Error if Azure credentials are missing, API fails, or JSON is malformed.
 */
async function analyseHabit(habit: string): Promise<NudgeResult> {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (!apiKey || !endpoint) throw new Error("Missing Azure credentials");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      model: AZURE_MODEL,
      temperature: 0.1,
      max_output_tokens: 250,
      input: [
        { role: "system", content: buildClassifierPrompt() },
        { role: "user", content: `Classify this habit: "${habit}"` },
      ],
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(`Azure ${res.status}: ${err.error?.message ?? "unknown"}`);
  }

  const data = (await res.json()) as AzureResponse;
  const raw = data.output[0].content[0].text;

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in Azure response");

  const extracted = JSON.parse(raw.slice(start, end + 1)) as AIExtraction;
  const kgPerUnit = EMISSION_FACTORS[extracted.habitKey];
  if (kgPerUnit === undefined) throw new Error(`Unknown habitKey: ${extracted.habitKey}`);

  const co2kg = Math.round(kgPerUnit * extracted.quantity * extracted.frequencyPerYear);
  return {
    co2kg: Math.max(1, co2kg),
    trees: Math.max(1, Math.ceil(co2kg / 21)),
    nudge: String(extracted.nudge),
  };
}

/**
 * POST /api/nudge
 * Sanitizes input, calls the Azure classifier, falls back to rule-based engine on failure.
 *
 * @param request - Incoming HTTP POST request with `{ habit: string }` body.
 * @returns JSON NudgeResult or error response.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { habit?: unknown };
    const raw = typeof body.habit === "string" ? body.habit : "";
    const habit = sanitizeHabitInput(raw);

    if (!habit) {
      return NextResponse.json({ error: "Habit is required." }, { status: 400 });
    }

    let result: NudgeResult;
    try {
      result = await analyseHabit(habit);
    } catch (e) {
      console.warn("[nudge] Azure unavailable, using rule-based fallback:", e instanceof Error ? e.message : e);
      result = ruleBasedFallback(habit);
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
