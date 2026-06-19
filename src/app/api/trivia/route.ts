import { NextResponse } from "next/server";
import { fetchGroq } from "@/utils/ai";

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CacheEntry {
  data: TriviaQuestion[];
  expiresAt: number;
}
let cache: CacheEntry | null = null;

const SYSTEM_PROMPT = `Return a JSON array of exactly 5 objects. No markdown, no explanation — raw JSON only.
Generate 5 unique, interesting, and surprising trivia questions about sustainability, climate change, carbon footprints, or eco-friendly habits.
Each object must match this schema:
{"id":"unique_slug","question":"The question text?","options":["Option A","Option B","Option C","Option D"],"correctIndex":integer_0_to_3,"explanation":"1-2 sentences explaining the correct answer with an interesting fact."}`;

async function generateTrivia(): Promise<TriviaQuestion[]> {
  return fetchGroq<TriviaQuestion[]>(
    SYSTEM_PROMPT,
    "Generate 5 new random eco-trivia questions. Make sure they are different from standard common knowledge."
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  if (!forceRefresh && cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, { status: 200 });
  }

  try {
    const questions = await generateTrivia();
    
    // Cache for 10 minutes to avoid API spam
    cache = { data: questions, expiresAt: Date.now() + 600_000 };
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[trivia] API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
