import ArticleCard from "@/components/news/ArticleCard";
import { GET } from "@/app/api/news/route";
import type { NewsArticle } from "@/app/api/news/route";

export const metadata = {
  title: "EcoNudge | News & Blog",
  description: "Read the latest news and insights on carbon footprints and sustainability.",
};

export const dynamic = "force-dynamic";

async function fetchNews(): Promise<NewsArticle[]> {
  try {
    // Call the route handler function directly to bypass loopback HTTP issues on Cloud Run
    const req = new Request("http://localhost/api/news", { method: "GET" });
    const res = await GET(req);

    if (!res.ok) throw new Error("Failed to fetch news directly");
    return await res.json();
  } catch (err) {
    console.error(err);
    // Return an empty array to be handled by the UI gracefully
    return [];
  }
}

export default async function NewsPage() {
  const articles = await fetchNews();
  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <>
      <main className="flex-grow pt-32 pb-16 px-margin-mobile md:px-margin-desktop w-full max-w-content mx-auto relative z-10 min-h-screen">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <header className="text-center md:text-left max-w-2xl">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl" aria-hidden="true">
                newspaper
              </span>
              <h1 className="text-display-md font-quicksand font-bold text-on-background tracking-tight">
                News &amp; Blog
              </h1>
            </div>
            <p className="text-body-lg font-quicksand text-on-surface-variant">
              Daily insights, global updates, and deep dives into the science of carbon footprints and sustainable living.
            </p>
          </header>

          {/* Error / Empty State */}
          {articles.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-error/80">error</span>
              <h2 className="text-headline-md font-quicksand">Couldn&apos;t load today&apos;s news</h2>
              <p className="text-body-md text-on-surface-variant">
                Our AI reporters are currently taking a break. Please check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Featured Article (spans full width on tablet/desktop) */}
              {featuredArticle && <ArticleCard article={featuredArticle} isFeatured={true} />}

              {/* Secondary Articles */}
              {secondaryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
