import React from 'react';

export interface NudgeResult {
  trees: number;
  co2kg: number;
  nudge: string;
}

interface NudgeResultDisplayProps {
  error: string | null;
  result: NudgeResult | null;
  pledged: boolean;
  onPledge: () => void;
}

/** Displays the result of the habit analysis or an error state. */
export default function NudgeResultDisplay({
  error,
  result,
  pledged,
  onPledge,
}: NudgeResultDisplayProps) {
  return (
    <div
      className="bg-surface-container-low/50 rounded-xl p-6 border border-white/5 flex-grow flex flex-col justify-center items-center text-center gap-4 relative z-10"
      aria-live="polite"
      aria-atomic="true"
    >
      {error && (
        <p className="text-error text-body-md font-quicksand fade-in">{error}</p>
      )}

      {!result && !error && (
        <>
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-2">
            <span
              className="material-symbols-outlined text-secondary text-3xl"
              aria-hidden="true"
            >
              park
            </span>
          </div>
          <h3 className="text-headline-lg font-quicksand text-on-surface">
            The Tree Offset
          </h3>
          <p className="text-body-md font-quicksand text-on-surface-variant max-w-md">
            Enter a habit above to see its annual carbon footprint translated
            into the number of mature trees needed to offset it.
          </p>
        </>
      )}

      {result && (
        <div className="fade-in w-full flex flex-col items-center">
          <p className="text-on-surface-variant text-label-sm font-inter mb-4 uppercase tracking-widest">
            Annual Impact
          </p>
          <div className="flex justify-around w-full max-w-md bg-surface-container/80 rounded-lg p-4 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-error font-bold text-2xl font-inter">
                {result.co2kg} kg
              </span>
              <span className="text-label-sm font-inter text-outline">
                CO₂ / Year
              </span>
            </div>
            <div className="w-px bg-outline-variant" aria-hidden="true" />
            <div className="flex flex-col items-center">
              <span className="text-primary font-bold text-2xl font-inter">
                ~{result.trees} Trees
              </span>
              <span className="text-label-sm font-inter text-outline">
                To Offset
              </span>
            </div>
          </div>
          <p className="text-body-md font-quicksand text-secondary mb-6 max-w-lg">
            💡 {result.nudge}
          </p>
          
          {!pledged ? (
            <button
              onClick={onPledge}
              className="bg-primary text-on-primary px-6 py-3 rounded-full text-label-sm font-inter font-bold hover:bg-primary-fixed hover:text-on-primary-fixed transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                volunteer_activism
              </span>
              Pledge to improve this!
            </button>
          ) : (
            <div className="flex items-center gap-2 text-primary font-inter font-bold text-label-sm px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
              <span className="material-symbols-outlined" aria-hidden="true">
                check_circle
              </span>
              Pledge Added!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
