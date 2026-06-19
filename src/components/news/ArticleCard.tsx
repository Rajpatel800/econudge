"use client";

import { useState } from "react";
import Image from "next/image";
import type { NewsArticle } from "@/app/api/news/route";
import ArticleModal from "./ArticleModal";

interface ArticleCardProps {
  article: NewsArticle;
  isFeatured?: boolean;
}

export default function ArticleCard({ article, isFeatured = false }: ArticleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <article
      className={`glass-card rounded-2xl overflow-hidden flex flex-col ${
        isFeatured ? "md:col-span-2 lg:col-span-3" : ""
      } group`}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden shrink-0 bg-surface-container-high ${
          isFeatured ? "w-full h-64 md:h-80 lg:h-96" : "w-full h-48"
        }`}
      >
        <Image
          src={article.imageUrl}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={isFeatured ? "(max-width: 768px) 100vw, 100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          priority={isFeatured}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary/90 backdrop-blur-md text-on-primary text-[10px] font-inter font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-grow justify-between ${isFeatured ? "p-6 md:p-8 lg:p-10" : "p-6"}`}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary text-sm" aria-hidden="true">
              schedule
            </span>
            <span className="text-xs font-inter text-on-surface-variant/80">{article.readTime}</span>
          </div>

          <h3
            className={`font-quicksand font-bold text-on-surface mb-3 ${
              isFeatured ? "text-display-sm leading-tight" : "text-headline-md leading-snug"
            }`}
          >
            {article.title}
          </h3>

          <p className="text-body-md font-quicksand text-on-surface-variant mb-6">{article.summary}</p>
        </div>

        <div>
          <p className={`text-sm font-quicksand text-on-surface/80 whitespace-pre-wrap line-clamp-4 mb-6 ${isFeatured ? "block" : "hidden"}`}>
            {article.content}
          </p>

          <button
            className="text-label-sm font-inter text-primary font-semibold flex items-center gap-2 hover:text-primary-fixed transition-colors group/btn"
            aria-label={`Read full article: ${article.title}`}
            onClick={() => setIsModalOpen(true)}
          >
            Read Full Article
            <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </article>

    {isModalOpen && (
      <ArticleModal article={article} onClose={() => setIsModalOpen(false)} />
    )}
    </>
  );
}
