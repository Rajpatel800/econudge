/**
 * @fileoverview EcoTrivia — Orchestrates the AI-powered eco-trivia game.
 * Manages question fetching, session state, and delegates rendering to TriviaCard.
 * @module components/gamification/EcoTrivia
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import TriviaCard, { type TriviaQuestion } from "./TriviaCard";

/** Static fallback questions displayed when the API is unavailable. */
const FALLBACK_BANK: TriviaQuestion[] = [
  {
    id: "q1",
    question: "Which common household appliance consumes the most energy when left on standby?",
    options: ["TV", "Microwave", "Set-top box", "Phone charger"],
    correctIndex: 2,
    explanation: "Set-top boxes can draw up to 30W on standby continuously — more than a TV or microwave. Unplugging yours saves ~130 kWh per year.",
  },
  {
    id: "q2",
    question: "What percentage of global CO₂ emissions comes from the food system?",
    options: ["5%", "10%", "26%", "45%"],
    correctIndex: 2,
    explanation: "The global food system — including farming, transport, and waste — produces about 26% of all greenhouse gas emissions.",
  },
  {
    id: "q3",
    question: "How many litres of water does it take to produce a single beef burger?",
    options: ["50 litres", "200 litres", "660 litres", "2,000 litres"],
    correctIndex: 2,
    explanation: "A 150g beef burger requires approximately 660 litres of water — that's about 5 full bathtubs. Most of this is used to grow animal feed.",
  },
  {
    id: "q4",
    question: "Which mode of transport has the lowest carbon footprint per kilometre?",
    options: ["Electric car", "Train", "Bicycle", "Bus"],
    correctIndex: 2,
    explanation: "Cycling produces effectively zero emissions during use. Even accounting for manufacturing a bike, it emits only ~5g CO₂ per km vs ~21g for a train.",
  },
  {
    id: "q5",
    question: "How long does it take a plastic bag to decompose in a landfill?",
    options: ["10 years", "50 years", "200 years", "400–1,000 years"],
    correctIndex: 3,
    explanation: "Plastic bags can take between 400 and 1,000 years to fully break down — by which time they've released harmful microplastics into the soil and water.",
  },
];

/**
 * EcoTrivia orchestrates the trivia session: fetching questions, tracking seen
 * questions, and delegating card rendering to the TriviaCard component.
 *
 * @returns The full Eco-Trivia section with header and game card.
 */
export default function EcoTrivia() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const loadQuestions = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh ? "/api/trivia?refresh=1" : "/api/trivia";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as TriviaQuestion[];
      setQuestions(data);
    } catch {
      setQuestions(FALLBACK_BANK);
    } finally {
      const randomStart = Math.floor(Math.random() * 5);
      setCurrentIndex(randomStart);
      setSeen(new Set([randomStart]));
      setSelected(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void loadQuestions(false); }, 0);
    return () => clearTimeout(timer);
  }, [loadQuestions]);

  /** Selects the next unseen question, or fetches a new batch if all are seen. */
  function handleNext() {
    const unseen = questions.map((_, i) => i).filter((i) => !seen.has(i));
    if (unseen.length === 0) {
      void loadQuestions(true);
    } else {
      const nextIndex = unseen[Math.floor(Math.random() * unseen.length)];
      setSeen((prev) => new Set([...prev, nextIndex]));
      setCurrentIndex(nextIndex);
      setSelected(null);
    }
  }

  if (loading || questions.length === 0) {
    return (
      <section className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-secondary">quiz</span>
          <h2 className="text-headline-lg font-quicksand text-on-background">Eco-Trivia</h2>
        </div>
        <div data-testid="trivia-skeleton" className="glass-card rounded-2xl p-6 h-64 animate-pulse bg-surface-container/50" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="trivia-heading">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" aria-hidden="true">quiz</span>
          <h2 id="trivia-heading" className="text-headline-lg font-quicksand text-on-background">Eco-Trivia</h2>
          {questions !== FALLBACK_BANK && (
            <span className="text-[10px] font-inter text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full">
              AI Generated
            </span>
          )}
        </div>
      </div>
      <TriviaCard
        question={questions[currentIndex]}
        selected={selected}
        seenCount={seen.size}
        totalCount={questions.length}
        loading={loading}
        onAnswer={(i) => { if (selected === null) setSelected(i); }}
        onNext={handleNext}
      />
    </section>
  );
}
