import { Sparkles } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </span>
          Foundry
        </div>
        <p className="text-xs text-muted-foreground">
          Built with the Vercel AI Gateway. Not affiliated with GitHub, Supabase, or Vercel.
        </p>
      </div>
    </footer>
  )
}
