import { NextResponse } from "next/server";
import { fetchGroq, fetchUnsplashImage } from "@/utils/ai";

/** Simple in-memory cache — reuses results for 60 seconds to avoid 429s. */
interface CacheEntry {
  data: unknown[];
  expiresAt: number;
}
let cache: CacheEntry | null = null;

/** Topics already used this session to avoid repeat items on refresh. */
const usedTopics = new Set<string>();

const SYSTEM_PROMPT = `Return a JSON array of exactly 4 objects. No markdown, no explanation — raw JSON only.
Each object: {"id":"slug","name":"Item Name","tag":"Impact Level","tagVariant":"error","footprint":"X kg CO2","footprintDetail":"brief context","alternative":"One swap sentence","alternativeDetail":"2 sentences with data","impact":"1-2 sentence global stat","searchTerm":"image search term"}
tagVariant: error, warning, or neutral. Items must be common everyday activities or products with carbon footprints.`;

interface RawCatalogItem {
  id: string;
  name: string;
  tag: string;
  tagVariant: string;
  footprint: string;
  footprintDetail: string;
  alternative: string;
  alternativeDetail: string;
  impact: string;
  searchTerm: string;
}

/** Calls Groq via the shared utility to generate 4 fresh catalog items as structured JSON. */
async function generateCatalogItems(): Promise<RawCatalogItem[]> {
  const avoidNote =
    usedTopics.size > 0
      ? `Choose items DIFFERENT from: ${[...usedTopics].join(", ")}.`
      : "Choose a variety of everyday items from different categories.";

  const items = await fetchGroq<RawCatalogItem[]>(SYSTEM_PROMPT, avoidNote);

  // Track topics to avoid repeats
  items.forEach((item) => usedTopics.add(item.name));
  if (usedTopics.size > 20) usedTopics.clear();

  return items;
}

/** GET /api/catalog — returns 4 dynamically AI-generated catalog items with Unsplash images. */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  // Return cached result if still fresh and not a forced refresh
  if (!forceRefresh && cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, { status: 200 });
  }

  try {
    const rawItems = await generateCatalogItems();

    // Fetch Unsplash images concurrently
    const itemsWithImages = await Promise.all(
      rawItems.map(async (item) => {
        const image = await fetchUnsplashImage(item.searchTerm);
        return {
          id: item.id,
          name: item.name,
          tag: item.tag,
          tagVariant: item.tagVariant,
          footprint: item.footprint,
          footprintDetail: item.footprintDetail,
          alternative: item.alternative,
          alternativeDetail: item.alternativeDetail,
          impact: item.impact,
          imageUrl: image.url,
          imageAlt: image.alt,
        };
      })
    );

    // Cache for 60 seconds
    cache = { data: itemsWithImages, expiresAt: Date.now() + 60_000 };
    return NextResponse.json(itemsWithImages, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[catalog] API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
