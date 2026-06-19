const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Impact Report", href: "#" },
  { label: "Contact Us", href: "#" },
] as const;

/** Site-wide footer with navigation links and brand mark. */
export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest/40 backdrop-blur-[50px] w-full mt-auto border-t border-white/10 z-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-center py-base px-gutter gap-4 w-full max-w-content mx-auto min-h-[80px]">
        <div className="text-primary text-xl font-quicksand font-bold flex items-center gap-2">
          <span className="material-symbols-outlined" aria-hidden="true">
            eco
          </span>
          EcoNudge
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6 list-none p-0 m-0">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-label-sm font-inter text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-on-surface-variant text-sm text-center md:text-right font-quicksand">
          © 2024 EcoNudge. Nurturing the planet, one habit at a time.
        </p>
      </div>
    </footer>
  );
}
