"use client";

import { useState, useEffect, useCallback } from "react";
import CatalogCard from "./CatalogCard";
import type { CatalogItem } from "@/types/catalog";
import { getRandomItems } from "@/data/catalogItems";

type FetchState = "loading" | "success" | "error";

/** Skeleton placeholder card shown while items are loading. */
function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-32 bg-surface-container-high" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-surface-container-highest rounded w-2/3" />
        <div className="h-3 bg-surface-container-highest rounded w-full" />
        <div className="h-3 bg-surface-container-highest rounded w-4/5" />
      </div>
    </div>
  );
}

/** Fetches fresh catalog items from the AI-powered API route. */
async function fetchCatalogItems(forceRefresh = false): Promise<CatalogItem[]> {
  const url = forceRefresh ? "/api/catalog?refresh=1" : "/api/catalog";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch catalog");
  return res.json() as Promise<CatalogItem[]>;
}

/** Dynamically-generated Learn & Swap catalog powered by Gemini AI. */
export default function LearnAndSwap() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  const loadItems = useCallback(async (forceRefresh = false) => {
    setState("loading");
    setItems([]);
    try {
      const data = await fetchCatalogItems(forceRefresh);
      setItems(data);
      setState("success");
    } catch {
      // Fall back to static items so the page never breaks
      setItems(getRandomItems(4));
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadItems(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadItems]);

  function handleRefresh(): void {
    void loadItems(true);
  }

  return (
    <section
      id="catalog"
      className="mt-8 flex flex-col gap-6"
      aria-labelledby="catalog-heading"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed" aria-hidden="true">
            autorenew
          </span>
          <h2
            id="catalog-heading"
            className="text-headline-lg font-quicksand text-on-background"
          >
            Learn &amp; Swap Catalog
          </h2>
          {state === "success" && (
            <span className="text-[10px] font-inter text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              AI Generated
            </span>
          )}
        </div>

        <button
          id="catalog-refresh-btn"
          onClick={handleRefresh}
          disabled={state === "loading"}
          className="text-label-sm font-inter text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Load new AI-generated catalog items"
        >
          <span
            className={`material-symbols-outlined text-sm ${state === "loading" ? "animate-spin" : ""}`}
            aria-hidden="true"
          >
            {state === "loading" ? "progress_activity" : "refresh"}
          </span>
          {state === "loading" ? "Loading…" : "Refresh Items"}
        </button>
      </div>

      {/* Error Banner */}
      {state === "error" && (
        <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-sm" aria-hidden="true">info</span>
          <p className="text-sm font-quicksand text-on-surface-variant">
            Could not reach AI — showing sample items. Add your{" "}
            <code className="text-primary text-xs">GROQ_API_KEY</code> to{" "}
            <code className="text-primary text-xs">.env.local</code> to enable live generation.
          </p>
        </div>
      )}

      {/* Grid */}
      <div
        id="catalog-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        role="list"
        aria-label="Carbon footprint catalog items"
      >
        {state === "loading"
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} role="listitem">
                <SkeletonCard />
              </div>
            ))
          : items.map((item) => (
              <div key={item.id} role="listitem">
                <CatalogCard item={item} />
              </div>
            ))}
      </div>
    </section>
  );
}
