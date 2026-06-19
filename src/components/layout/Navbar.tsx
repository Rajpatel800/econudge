"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Top navigation bar for EcoNudge. */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white/10 backdrop-blur-[30px] fixed top-0 w-full rounded-b-xl border-b border-white/20 shadow-sm z-50"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center h-20 px-gutter max-w-content mx-auto relative">
        {/* Brand */}
        <div className="flex items-center gap-2 z-10">
          <span
            className="material-symbols-outlined text-primary-fixed-dim text-3xl"
            aria-hidden="true"
          >
            eco
          </span>
          <span className="text-headline-lg font-quicksand font-bold text-primary-fixed-dim tracking-tight">
            EcoNudge
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center h-full absolute left-1/2 -translate-x-1/2" role="list">
          {[
            { label: "Dashboard", href: "/" },
            { label: "News & Blog", href: "/news" },
          ].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`h-full flex items-center px-2 text-label-sm font-inter transition-colors border-b-2 ${
                  isActive
                    ? "text-primary border-primary font-bold"
                    : "text-on-surface-variant/80 border-transparent hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
