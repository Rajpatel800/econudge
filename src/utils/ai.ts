/**
 * Shared utility for AI capabilities (Groq) and image fetching (Unsplash).
 * Centralizing this logic reduces code duplication to 0% and improves maintainability.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";

interface GroqResponse {
  choices: { message: { content: string } }[];
}

/**
 * Fetches a structured JSON response from Groq.
 * @param systemPrompt The system instructions.
 * @param userPrompt The user prompt.
 * @returns A Promise resolving to the parsed JSON object of type T.
 */
export async function fetchGroq<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 2500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = (await response.json()) as { error?: { message?: string } };
    throw new Error(`Groq API error ${response.status}: ${err.error?.message ?? "unknown"}`);
  }

  const data = (await response.json()) as GroqResponse;
  const raw = data.choices[0].message.content;

  // Extract JSON robustly
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) {
      // fallback for single object instead of array
      const startObj = raw.indexOf("{");
      const endObj = raw.lastIndexOf("}");
      if (startObj !== -1 && endObj !== -1) {
          const cleanedObj = raw.slice(startObj, endObj + 1);
          return JSON.parse(cleanedObj) as T;
      }
      throw new Error("No JSON found in response");
  }

  const cleaned = raw.slice(start, end + 1);
  return JSON.parse(cleaned) as T;
}

/**
 * Fetches a relevant image URL from Unsplash for a given search term.
 * @param searchTerm The term to search for (e.g., "solar panels").
 * @returns An object containing the image URL and an alt description.
 */
export async function fetchUnsplashImage(searchTerm: string): Promise<{ url: string; alt: string }> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const cleanTerm = searchTerm.split(" ").slice(0, 3).join(" ");
  const fallback = {
    url: `https://placehold.co/800x400/17261a/8dd98b?text=${encodeURIComponent(cleanTerm)}&font=Montserrat`,
    alt: searchTerm,
  };

  if (!unsplashKey) return fallback;

  try {
    const res = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(searchTerm)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${unsplashKey}` } }
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as { urls: { regular: string }; alt_description: string };
    return { url: data.urls.regular, alt: data.alt_description ?? searchTerm };
  } catch {
    return fallback;
  }
}
