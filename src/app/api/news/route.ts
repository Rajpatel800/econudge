import { NextResponse } from "next/server";
import { fetchGroq, fetchUnsplashImage } from "@/utils/ai";

/** Cached news entries to simulate "daily" updates */
interface CacheEntry {
  data: unknown[];
  dateStr: string;
}
let cache: CacheEntry | null = null;

const SYSTEM_PROMPT = `You are a climate science journalist. Write exactly 4 short, engaging news articles or blog posts about sustainability, eco-friendly innovations, or carbon footprints. 
Return ONLY a valid JSON array with exactly 4 objects. No markdown, no explanation.

Each object must match this schema exactly:
{
  "id": "slug-style-id",
  "title": "Article Title (Max 60 chars)",
  "summary": "A punchy 1-2 sentence hook.",
  "content": "The full article content (3-4 paragraphs). Use line breaks (\\n\\n) to separate paragraphs.",
  "readTime": "e.g. 3 min read",
  "category": "e.g. Innovation, Eco-Tip, or Climate News",
  "searchTerm": "A 1-2 word search term to fetch an Unsplash image (e.g. 'solar panels', 'forest')"
}`;

export interface RawNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  readTime: string;
  category: string;
  searchTerm: string;
}

export interface NewsArticle extends Omit<RawNewsArticle, "searchTerm"> {
  imageUrl: string;
  imageAlt: string;
}

/** Calls Groq via the shared utility to generate 4 fresh news articles as structured JSON. */
async function generateNewsArticles(): Promise<RawNewsArticle[]> {
  return fetchGroq<RawNewsArticle[]>(
    SYSTEM_PROMPT,
    "Write 4 fresh articles for today's eco-blog."
  );
}

/** GET /api/news — returns 4 dynamically AI-generated news articles with images. */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";
  
  // Create a localized date string (e.g. "Fri Jun 19 2026")
  const todayStr = new Date().toDateString();

  // Return cached result if it's the exact same calendar day and not a forced refresh
  if (!forceRefresh && cache && cache.dateStr === todayStr) {
    return NextResponse.json(cache.data, { status: 200 });
  }

  try {
    const rawArticles = await generateNewsArticles();

    // Fetch Unsplash images concurrently
    const articlesWithImages = await Promise.all(
      rawArticles.map(async (article) => {
        const image = await fetchUnsplashImage(article.searchTerm);
        return {
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          readTime: article.readTime,
          category: article.category,
          imageUrl: image.url,
          imageAlt: image.alt,
        };
      })
    );

    // Cache for the current calendar day
    cache = { data: articlesWithImages, dateStr: todayStr };
    return NextResponse.json(articlesWithImages, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[news] API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
