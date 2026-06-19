"use client";

import type { NewsArticle } from "@/app/api/news/route";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${article.id}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Panel */}
      <div className="glass-panel relative z-10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Close Button (Floating) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
          aria-label="Close article"
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        {/* Image Column */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto shrink-0 bg-surface-container-high">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-6 left-6 pr-6">
              <span className="bg-primary/90 text-on-primary text-[10px] font-inter font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block shadow-sm">
                {article.category}
              </span>
              <h2 id={`modal-title-${article.id}`} className="text-2xl md:text-3xl font-quicksand font-bold text-white leading-tight">
                {article.title}
              </h2>
            </div>
          </div>

          {/* Content Column */}
          <div className="flex flex-col flex-1 bg-surface/95 p-6 md:p-10 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 text-on-surface-variant/80 border-b border-white/10 pb-4">
              <span className="material-symbols-outlined text-secondary" aria-hidden="true">schedule</span>
              <span className="text-sm font-inter">{article.readTime}</span>
            </div>

            <p className="text-lg font-quicksand font-medium text-on-surface mb-8 leading-relaxed italic border-l-4 border-primary pl-4">
              {article.summary}
            </p>

            <div className="prose prose-invert max-w-none font-quicksand text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>

            <div className="mt-12 pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full md:w-auto md:px-8 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant py-3 rounded-xl font-inter font-semibold transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
      </div>
    </div>,
    document.body
  );
}
