import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Foundry
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#demo" className="transition-colors hover:text-foreground">
            Demo
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#integrations" className="transition-colors hover:text-foreground">
            Integrations
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:inline">
            Free forever
          </span>
          <Button size="sm" render={<a href="#demo">Start building</a>} />
        </div>
      </div>
    </header>
  )
}
