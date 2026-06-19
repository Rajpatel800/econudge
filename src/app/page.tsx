import CarbonTicker from "@/components/home/CarbonTicker";
import NudgeEngine from "@/components/features/NudgeEngine";
import PledgeCard from "@/components/gamification/PledgeCard";
import EcoTrivia from "@/components/gamification/EcoTrivia";
import LearnAndSwap from "@/components/features/LearnAndSwap";

/** EcoNudge main dashboard page. */
export default function HomePage() {
  return (
    <>
      <main className="flex-grow pt-28 pb-16 px-margin-mobile md:px-margin-desktop w-full max-w-content mx-auto flex flex-col gap-8 md:gap-12 relative z-10">
        {/* Hero — Live Carbon Counter */}
        <CarbonTicker />

        {/* Main Dashboard Grid — Nudge Engine + Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <NudgeEngine />

          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">
            <PledgeCard />
            <EcoTrivia />
          </div>
        </div>

        {/* Education — Learn & Swap Catalog */}
        <LearnAndSwap />
      </main>
    </>
  );
}
