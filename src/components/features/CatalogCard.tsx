"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/types/catalog";
import CatalogModal from "./CatalogModal";

const TAG_STYLES: Record<CatalogItem["tagVariant"], string> = {
  error: "bg-error-container text-on-error-container",
  warning: "bg-surface-bright text-on-surface border border-outline-variant",
  neutral: "bg-surface-container text-on-surface",
};

const DOT_STYLES: Record<CatalogItem["tagVariant"], string> = {
  error: "bg-error",
  warning: "bg-secondary",
  neutral: "bg-outline",
};

interface CatalogCardProps {
  item: CatalogItem;
}

/** Renders a single clickable catalog card that opens a detail modal. */
export default function CatalogCard({ item }: CatalogCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article
        className="glass-card rounded-xl overflow-hidden group flex flex-col cursor-pointer"
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Learn more about ${item.name}`}
      >
        <div className="h-32 bg-surface-container-high relative overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-4 left-4">
            <h3 className="text-lg font-quicksand font-semibold text-white mb-1">{item.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter flex items-center gap-1 w-fit ${TAG_STYLES[item.tagVariant]}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_STYLES[item.tagVariant]}`} aria-hidden="true" />
              {item.tag}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-label-sm font-inter text-outline">Avg Footprint</span>
            <span className="text-body-md font-quicksand font-bold text-on-surface">{item.footprint}</span>
          </div>
          <div className="mt-auto">
            <p className="text-label-sm font-inter text-primary mb-2">Greener Alternative:</p>
            <p className="text-sm font-quicksand text-on-surface-variant line-clamp-2">{item.alternative}</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-primary text-[11px] font-inter font-semibold">
            <span>Tap to learn more</span>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
          </div>
        </div>
      </article>

      {isOpen && <CatalogModal item={item} onClose={() => setIsOpen(false)} />}
    </>
  );
}
