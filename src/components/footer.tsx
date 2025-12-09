import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border animate-fade-in">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-background">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Optix</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="#"
              className="relative hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              Docs
            </Link>
            <Link
              href="#"
              className="relative hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              GitHub
            </Link>
            <Link
              href="#"
              className="relative hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              Twitter
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">Open source under MIT</p>
        </div>
      </div>
    </footer>
  )
}
