"use client";

import { useEffect, useRef } from "react";

// Based on 2024 global fossil CO2 emissions of ~39.63 billion metric tons
// That equates to ~1,256,743 kg of CO2 per second globally.
const EMISSIONS_PER_SECOND_KG = 1256743;
const TICK_INTERVAL_MS = 100; // update faster for dramatic effect
const INCREMENT_PER_TICK = EMISSIONS_PER_SECOND_KG / (1000 / TICK_INTERVAL_MS);

/** Animates the live global CO₂ emissions counter ticker. */
export default function CarbonTicker() {
  const counterRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(0);

  useEffect(() => {
    // Calculate emissions elapsed so far this year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const secondsElapsedThisYear = (now.getTime() - startOfYear.getTime()) / 1000;
    valueRef.current = secondsElapsedThisYear * EMISSIONS_PER_SECOND_KG;
    const interval = setInterval(() => {
      valueRef.current += INCREMENT_PER_TICK;
      if (counterRef.current) {
        counterRef.current.textContent = valueRef.current.toLocaleString(
          "en-US",
          { maximumFractionDigits: 0 }
        );
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="dashboard"
      className="flex flex-col items-center justify-center py-12 md:py-20 text-center relative"
      aria-labelledby="collective-impact-heading"
    >
      <h1
        id="collective-impact-heading"
        className="text-headline-xl font-quicksand font-bold text-on-background mb-4"
      >
        Global CO₂ Emissions
      </h1>
      <p className="text-body-md font-quicksand text-on-surface-variant mb-8 max-w-2xl">
        This is not a simulation. Based on 2024 scientific data, the world emits over 39.6 billion metric tons of CO₂ annually. That means the number below is growing constantly.
      </p>

      <div className="glass-panel rounded-[2rem] p-8 md:p-12 inline-flex flex-col items-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-error/5 blur-3xl rounded-full mix-blend-screen pointer-events-none"
          aria-hidden="true"
        />
        <span className="text-label-sm font-inter text-error mb-2 uppercase tracking-widest">
          CO₂ Emitted This Year (kg)
        </span>
        <div
          ref={counterRef}
          className="ticker-text text-white font-bold font-inter tabular-nums"
          style={{ fontSize: "clamp(36px, 6vw, 84px)", lineHeight: 1 }}
          aria-live="polite"
          aria-label="Live global CO₂ emissions counter in kilograms"
        >
          Loading...
        </div>
        <div className="mt-6 flex items-center gap-2 text-error text-label-sm font-inter bg-error/10 border border-error/20 px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            warning
          </span>
          Increasing by ~1.25 million kg/sec
        </div>
      </div>
    </section>
  );
}
