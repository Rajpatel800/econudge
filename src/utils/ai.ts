/**
 * Shared utility for AI capabilities (Groq) and image fetching (Unsplash).
 * Centralizing this logic reduces code duplication to 0% and improves maintainability.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";

/**
 * Structure of the payload returned by the Groq OpenAI-compatible completions API.
 */
interface GroqResponse {
  choices: { message: { content: string } }[];
}

/**
 * Fetches a strictly structured JSON response from Groq using llama-3.3-70b-versatile.
 * This function acts as the central AI generation engine for non-deterministic tasks
 * (like News, Trivia, and Catalog generation), saving costs on premium Azure tokens.
 *
 * @param systemPrompt - The strict system instructions guiding the AI's behavior.
 * @param userPrompt - The specific task or context provided by the user/system.
 * @returns A Promise resolving to the parsed JSON object of generic type T.
 * @throws Will throw an Error if the API is unreachable or fails to return valid JSON.
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
 * Dynamically fetches a relevant, high-quality image URL from Unsplash.
 * Utilizes the Unsplash API with strict content filtering to ensure professional UI/UX.
 * If the API rate limit is hit or the network fails, it seamlessly falls back to a 
 * beautifully styled placeholder image generated via Placehold.co.
 *
 * @param searchTerm - The specific keyword to search for (e.g., "solar panels", "electric car").
 * @returns An object containing the secure image `url` and an accessible `alt` description.
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
