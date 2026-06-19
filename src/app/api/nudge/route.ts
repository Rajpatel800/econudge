import { NextResponse } from "next/server";
import { sanitizeHabitInput } from "@/utils/sanitizer";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface NudgeResult {
  trees: number;
  co2kg: number;
  nudge: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

/** Calls Groq (Llama 3.3 70B) to estimate carbon footprint of any habit. */
async function analyseWithGroq(habit: string): Promise<NudgeResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
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
          content: `Estimate the annual CO₂ impact of this habit: "${habit}". Rules: co2kg must be a realistic integer (e.g. 1 cigarette/day≈5, daily beef≈700, monthly short flight≈3060, 2h Netflix/day≈26, 10mi commute/day≈1050). trees = Math.ceil(co2kg/21). nudge must be specific to this habit.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(`Groq ${res.status}: ${err.error?.message ?? "unknown"}`);
  }

  const data = (await res.json()) as GroqResponse;
  const raw = data.choices[0].message.content;

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in Groq response");

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
      result = await analyseWithGroq(habit);
    } catch (e) {
      console.warn("[nudge] Groq unavailable, using rule-based fallback:", e instanceof Error ? e.message : e);
      result = ruleBasedFallback(habit);
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
