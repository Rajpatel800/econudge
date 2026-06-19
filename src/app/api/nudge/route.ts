import { NextResponse } from "next/server";
import { sanitizeHabitInput } from "@/utils/sanitizer";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o";

interface NudgeResult {
  trees: number;
  co2kg: number;
  nudge: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

/** Calls OpenAI (GPT-4o) to estimate carbon footprint of any habit. */
async function analyseWithOpenAI(habit: string): Promise<NudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No OPENAI_API_KEY");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            'You are a carbon footprint calculator. Always respond with ONLY valid JSON — no markdown, no explanation. Format: {"co2kg":<integer>,"trees":<integer>,"nudge":"<one sentence tip specific to the habit>"}',
        },
        {
          role: "user",
          content: `Analyze this daily habit using real-world scientific data and carbon emission statistics: "${habit}". 
          
Step 1: Estimate the footprint in kg of CO2 per occurrence.
Step 2: Multiply by the frequency to get the total ANNUAL kg of CO2 (co2kg).
Step 3: Calculate trees needed to offset (trees = Math.ceil(co2kg / 21)).
Step 4: Provide a specific, actionable nudge.

Rules: co2kg and trees MUST be integers. Do not explain the math, just return the JSON.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(`OpenAI ${res.status}: ${err.error?.message ?? "unknown"}`);
  }

  const data = (await res.json()) as GroqResponse;
  const raw = data.choices[0].message.content;

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in OpenAI response");

  const parsed = JSON.parse(raw.slice(start, end + 1)) as NudgeResult;
  return {
    co2kg: Math.max(1, Math.round(Number(parsed.co2kg))),
    trees: Math.max(1, Math.round(Number(parsed.trees))),
    nudge: String(parsed.nudge),
  };
}

/** Rule-based fallback when AI is unavailable. */
function ruleBasedFallback(habit: string): NudgeResult {
  const h = habit.toLowerCase();

  const milesMatch = h.match(/(\d+(?:\.\d+)?)\s*miles?/i);
  if (milesMatch) {
    const co2kg = Math.round(parseFloat(milesMatch[1]) * 2 * 0.21 * 250);
    return { co2kg, trees: Math.ceil(co2kg / 21), nudge: "Try carpooling or working from home one day a week to cut this by 20%." };
  }
  if (h.includes("cigarette") || h.includes("smoke") || h.includes("cigar")) {
    const n = parseInt(h.match(/(\d+)/)?.[1] ?? "1");
    const co2kg = Math.max(5, Math.round(n * 0.0015 * 365));
    return { co2kg, trees: Math.ceil(co2kg / 21), nudge: "Each cigarette pack produces ~3.5 kg CO₂. Cutting back saves both carbon and health costs." };
  }
  if (h.includes("flight") || h.includes("fly") || h.includes("plane"))
    return { co2kg: 255, trees: 13, nudge: "Consider trains for journeys under 500 km — they emit 90% less CO₂ than flying." };
  if (h.includes("beef") || h.includes("burger") || h.includes("steak") || h.includes("meat"))
    return { co2kg: 700, trees: 34, nudge: "One meat-free day per week saves ~350 kg CO₂/year — equal to 3 months of not driving." };
  if (h.includes("stream") || h.includes("netflix") || h.includes("youtube") || h.includes("video"))
    return { co2kg: 26, trees: 2, nudge: "Download content over Wi-Fi and watch offline — streaming on cellular uses 20× more energy." };

  return { co2kg: 180, trees: 9, nudge: "Small swaps add up. Try one plant-based meal a week to reduce your annual footprint." };
}

/** POST /api/nudge — analyses any daily habit and returns its carbon impact. */
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
      result = await analyseWithOpenAI(habit);
    } catch (e) {
      console.warn("[nudge] OpenAI unavailable, using rule-based fallback:", e instanceof Error ? e.message : e);
      result = ruleBasedFallback(habit);
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
