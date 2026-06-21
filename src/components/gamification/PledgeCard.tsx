/**
 * @fileoverview PledgeCard — Displays active pledge streaks with a stacked card UI.
 * Uses PledgeRing and EmptyPledges sub-components for clean separation of concerns.
 * @module components/gamification/PledgeCard
 */
"use client";

import { useState } from "react";
import { usePledges } from "@/hooks/usePledges";
import PledgeRing from "./PledgeRing";
import EmptyPledges from "./EmptyPledges";

/**
 * Renders the stacked pledge card carousel.
 * Each card shows the user's daily eco-pledge streak and progress.
 *
 * @returns The full Pledges section including header and card stack.
 */
export default function PledgeCard() {
  const { pledges, incrementPledge } = usePledges();
  const [activeIndex, setActiveIndex] = useState(0);
  const today = new Date().toDateString();

  /** Advances to the next pledge card in the stack. */
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
        <span className="material-symbols-outlined text-tertiary" aria-hidden="true">
          local_fire_department
        </span>
        <h2 id="pledges-heading" className="text-headline-lg font-quicksand text-on-background">
          Pledges
        </h2>
      </div>

      <div className="relative w-full max-w-[400px] mx-auto h-[360px] perspective-1000">
        {pledges.length === 0 ? (
          <EmptyPledges />
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
                  if (!isTop) setActiveIndex(i);
                }}
                className={`absolute inset-0 bg-[#243627] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 ease-out shadow-2xl origin-top ${
                  isTop && isCheckedIn ? "opacity-90 cursor-default" : "cursor-pointer hover:border-white/20"
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
                  <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" aria-hidden="true" />
                )}

                <div className="relative w-24 h-24 mb-4">
                  <PledgeRing progress={pledge.progress} />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-headline-lg font-quicksand font-bold text-tertiary leading-none">{pledge.days}</span>
                    <span className="text-[10px] font-inter text-tertiary uppercase">Days</span>
                  </div>
                </div>

                <h3 className="text-body-md font-quicksand font-bold text-on-surface mb-1 px-8">{pledge.label}</h3>
                <p className="text-label-sm font-inter text-on-surface-variant line-clamp-2 px-8">{pledge.message}</p>

                <div className={`mt-4 transition-opacity text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isTop && isCheckedIn ? "text-on-surface-variant opacity-100" : "opacity-0 hover:opacity-100 text-tertiary"}`}>
                  {isTop && isCheckedIn ? (
                    <><span className="material-symbols-outlined text-[14px]">check_circle</span>Checked in today</>
                  ) : isTop ? (
                    <><span className="material-symbols-outlined text-[14px]">add_circle</span>Click to check in</>
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
