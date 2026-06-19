"use client";

import { useState } from "react";
import { usePledges } from "@/hooks/usePledges";

/** Circular SVG progress ring for the pledge streak. */
function PledgeRing({ progress }: { progress: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="w-full h-full -rotate-90"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="8"
      />
      <circle
        className="ring-glow transition-all duration-1000 ease-out"
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#acd0ab"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="8"
      />
    </svg>
  );
}

/** Displays active pledge streaks with a stacked card UI. */
export default function PledgeCard() {
  const { pledges, incrementPledge } = usePledges();
  const [activeIndex, setActiveIndex] = useState(0);
  const today = new Date().toDateString();

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % pledges.length);
  };

  return (
    <section
      id="pledges"
      className="flex flex-col gap-4"
      aria-labelledby="pledges-heading"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols-outlined text-tertiary"
          aria-hidden="true"
        >
          local_fire_department
        </span>
        <h2
          id="pledges-heading"
          className="text-headline-lg font-quicksand text-on-background"
        >
          Pledges
        </h2>
      </div>

      <div className="relative w-full max-w-[400px] mx-auto h-[360px] perspective-1000">
        {pledges.length === 0 ? (
          <div className="absolute inset-0 glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-white/20">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              nature_people
            </span>
            <h3 className="text-headline-md font-quicksand font-bold text-on-surface mb-2">
              Start Your Eco Journey
            </h3>
            <p className="text-body-md font-inter text-on-surface-variant max-w-md mb-6">
              Take your first pledge by analyzing your daily habits using the AI Nudge Engine above.
            </p>
            <button
              onClick={() => document.getElementById("nudge")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-surface-bright text-primary px-6 py-3 rounded-full text-label-sm font-inter font-bold hover:bg-surface-container-high transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Analyze a Habit
            </button>
          </div>
        ) : (
          pledges.map((pledge, i) => {
            const isCheckedIn = pledge.lastCheckedIn === today;
            let offset = i - activeIndex;
            if (offset < 0) offset += pledges.length;
            
            const isTop = offset === 0;
            const isVisible = offset < 3;

            return (
              <div
                key={pledge.id}
                onClick={() => {
                  if (isTop && !isCheckedIn) incrementPledge(pledge.id);
                  if (!isTop) setActiveIndex(i); // Click background card to bring to front
                }}
                className={`absolute inset-0 bg-[#243627] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 ease-out shadow-2xl origin-top ${
                  isTop && isCheckedIn 
                    ? "opacity-90 cursor-default" 
                    : "cursor-pointer hover:border-white/20"
                }`}
                style={{
                  zIndex: 50 - offset,
                  transform: `translateY(${offset * 16}px) scale(${1 - offset * 0.05})`,
                  opacity: isVisible ? 1 - offset * 0.2 : 0,
                  pointerEvents: isVisible ? "auto" : "none",
                  visibility: isVisible ? "visible" : "hidden",
                }}
                role="button"
                aria-label={isTop ? (isCheckedIn ? `Already checked in ${pledge.label} today` : `Increment ${pledge.label} pledge streak`) : `Bring ${pledge.label} to front`}
                aria-disabled={isTop && isCheckedIn}
              >
                {/* Arrow Button for the top card if there are multiple cards */}
                {isTop && pledges.length > 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors z-20"
                    aria-label="Next pledge"
                  >
                    <span className="material-symbols-outlined text-white">arrow_forward_ios</span>
                  </button>
                )}

                {isTop && !isCheckedIn && (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                )}

                <div className="relative w-24 h-24 mb-4">
                  <PledgeRing progress={pledge.progress} />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-headline-lg font-quicksand font-bold text-tertiary leading-none">
                      {pledge.days}
                    </span>
                    <span className="text-[10px] font-inter text-tertiary uppercase">
                      Days
                    </span>
                  </div>
                </div>
                
                <h3 className="text-body-md font-quicksand font-bold text-on-surface mb-1 px-8">
                  {pledge.label}
                </h3>
                <p className="text-label-sm font-inter text-on-surface-variant line-clamp-2 px-8">
                  {pledge.message}
                </p>
                
                <div className={`mt-4 transition-opacity text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isTop && isCheckedIn ? "text-on-surface-variant opacity-100" : "opacity-0 hover:opacity-100 text-tertiary"}`}>
                  {isTop && isCheckedIn ? (
                    <>
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Checked in today
                    </>
                  ) : isTop ? (
                    <>
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      Click to check in
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
