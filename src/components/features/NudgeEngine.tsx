"use client";

import { useState, type FormEvent } from "react";
import { usePledges } from "@/hooks/usePledges";
import NudgeResultDisplay, { type NudgeResult } from "./NudgeResultDisplay";

/** Calls the AI nudge API and returns a parsed result. */
async function fetchNudge(habit: string): Promise<NudgeResult> {
  const response = await fetch("/api/nudge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habit }),
  });
  if (!response.ok) throw new Error("Failed to analyse habit");
  return response.json() as Promise<NudgeResult>;
}

/** Interactive form that analyses a user's daily habit and shows its carbon impact. */
export default function NudgeEngine() {
  const [habit, setHabit] = useState("");
  const [result, setResult] = useState<NudgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledged, setPledged] = useState(false);
  const { addPledge } = usePledges();

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!habit.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPledged(false);
    try {
      const data = await fetchNudge(habit.trim());
      setResult(data);
    } catch {
      setError("Could not analyse your habit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePledge() {
    if (!result) return;
    // Derive a short label from the habit input
    const shortLabel = habit.length > 25 ? habit.substring(0, 22) + "..." : habit;
    // The message is the AI's tip
    addPledge(`Improve: ${shortLabel}`, result.nudge);
    setPledged(true);
    // Smooth scroll down to the pledges section
    setTimeout(() => {
      document.getElementById("pledges")?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  }

  return (
    <section
      id="nudge"
      className="md:col-span-8 flex flex-col gap-4"
      aria-labelledby="nudge-heading"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-secondary" aria-hidden="true">
          psychology
        </span>
        <h2
          id="nudge-heading"
          className="text-headline-lg font-quicksand text-on-background"
        >
          Personal Nudge Engine
        </h2>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6 h-full relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 relative z-10"
          aria-label="Habit analyser form"
        >
          <label
            htmlFor="habit-input"
            className="text-label-sm font-inter text-primary-fixed-dim"
          >
            What is a daily habit you want to check?
          </label>
          <div className="flex gap-4">
            <input
              id="habit-input"
              type="text"
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              placeholder="e.g., Driving 15 miles to work..."
              className="glass-input flex-grow rounded-lg px-4 py-3 text-body-md font-quicksand"
              aria-required="true"
              disabled={loading}
            />
            <button
              type="submit"
              id="analyse-btn"
              disabled={loading || !habit.trim()}
              className="bg-surface-bright text-primary border border-primary/30 hover:border-primary hover:bg-surface-container-high px-6 py-3 rounded-lg text-label-sm font-inter transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Analyse habit"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                search
              </span>
              {loading ? "Analysing…" : "Analyse"}
            </button>
          </div>
        </form>

        {/* Result Area */}
        <NudgeResultDisplay
          error={error}
          result={result}
          pledged={pledged}
          onPledge={handlePledge}
        />
      </div>
    </section>
  );
}
