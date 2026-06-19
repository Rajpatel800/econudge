"use client";

import { useEffect, useRef } from "react";

const INCREMENT_MIN = 0.05;
const INCREMENT_RANGE = 0.2;
const TICK_INTERVAL_MS = 1000;
const BASE_VALUE = 14208.45;

/** Animates the live global CO₂ offset counter ticker. */
export default function CarbonTicker() {
  const counterRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(BASE_VALUE);

  useEffect(() => {
    const interval = setInterval(() => {
      valueRef.current += Math.random() * INCREMENT_RANGE + INCREMENT_MIN;
      if (counterRef.current) {
        counterRef.current.textContent = valueRef.current.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
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
        Collective Impact
      </h1>
      <p className="text-body-md font-quicksand text-on-surface-variant mb-8 max-w-2xl">
        Together, we are shifting the balance. Watch our real-time carbon offset
        model in action.
      </p>

      <div className="glass-panel rounded-[2rem] p-8 md:p-12 inline-flex flex-col items-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-primary/5 blur-3xl rounded-full mix-blend-screen pointer-events-none"
          aria-hidden="true"
        />
        <span className="text-label-sm font-inter text-primary mb-2 uppercase tracking-widest">
          CO₂ Offset (kg)
        </span>
        <div
          ref={counterRef}
          className="ticker-text text-white font-bold font-inter tabular-nums"
          style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 1 }}
          aria-live="polite"
          aria-label="Live CO₂ offset counter in kilograms"
        >
          14,208.45
        </div>
        <div className="mt-6 flex items-center gap-2 text-tertiary-fixed text-label-sm font-inter bg-tertiary-fixed/10 px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            trending_up
          </span>
          Increasing by ~0.15 kg/sec
        </div>
      </div>
    </section>
  );
}
