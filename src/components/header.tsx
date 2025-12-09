import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl animate-fade-in-down">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-background">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Optix</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#demo"
            className="relative text-sm text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
          >
            Demo
          </Link>
          <Link
            href="#features"
            className="relative text-sm text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
          >
            Features
          </Link>
          <Link
            href="#docs"
            className="relative text-sm text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
          >
            Docs
          </Link>
          <Link
            href="#pricing"
            className="relative text-sm text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex text-muted-foreground hover:scale-105 transition-transform"
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
