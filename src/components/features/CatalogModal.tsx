"use client";

import Image from "next/image";
import type { CatalogItem } from "@/types/catalog";

interface CatalogModalProps {
  item: CatalogItem;
  onClose: () => void;
}

/** Side-by-side detail modal: image left, content right — no scrolling needed. */
export default function CatalogModal({ item, onClose }: CatalogModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${item.id}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Horizontal Panel */}
      <div className="glass-panel relative z-10 rounded-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden">

        {/* LEFT — Image Column */}
        <div className="relative w-full md:w-56 shrink-0 h-52 md:h-auto">
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="224px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 to-transparent" aria-hidden="true" />
          {/* Title overlay on mobile */}
          <div className="absolute bottom-4 left-4 md:hidden">
            <h2 className="text-lg font-quicksand font-bold text-white">{item.name}</h2>
          </div>
        </div>

        {/* RIGHT — Content Column */}
        <div className="flex flex-col flex-1 p-6 gap-4 relative">
          {/* Close */}
          <button
            id={`close-modal-${item.id}`}
            onClick={onClose}
            className="absolute top-4 right-4 bg-surface-container hover:bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close detail panel"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg" aria-hidden="true">close</span>
          </button>

          {/* Title */}
          <div className="pr-10">
            <h2 id={`modal-title-${item.id}`} className="text-xl font-quicksand font-bold text-on-surface">
              {item.name}
            </h2>
            <p className="text-label-sm font-inter text-on-surface-variant">{item.tag}</p>
          </div>

          {/* Footprint */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-inter font-bold text-primary">{item.footprint}</span>
            <span className="text-xs font-inter text-on-surface-variant">{item.footprintDetail}</span>
          </div>

          {/* Global Impact */}
          <div className="bg-error-container/20 border border-error/30 rounded-xl p-3">
            <p className="text-[11px] font-inter text-error uppercase tracking-widest mb-1">🌍 Global Impact</p>
            <p className="text-sm font-quicksand text-on-surface leading-relaxed">{item.impact}</p>
          </div>

          {/* Greener Swap */}
          <div className="bg-primary/10 border border-primary/25 rounded-xl p-3">
            <p className="text-[11px] font-inter text-primary uppercase tracking-widest mb-1">♻️ Your Greener Swap</p>
            <p className="text-sm font-quicksand font-bold text-on-surface mb-1">{item.alternative}</p>
            <p className="text-sm font-quicksand text-on-surface-variant leading-relaxed">{item.alternativeDetail}</p>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-inter font-semibold text-sm hover:bg-primary-fixed transition-colors mt-auto"
          >
            Got it, I&apos;ll make the swap! 🌿
          </button>
        </div>
      </div>
    </div>
  );
}
