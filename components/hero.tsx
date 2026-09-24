import { GeneratorDemo } from "@/components/generator-demo"

export function Hero() {
  return (
    <section id="demo" className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%), radial-gradient(40% 40% at 85% 20%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            Open, free AI models — no credit card
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Ship full websites and apps from a single prompt
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Foundry is a free AI agent that turns plain language into production-ready code — then pushes it to GitHub,
            wires up Supabase, and deploys to Vercel.
          </p>
        </div>

        <GeneratorDemo />
      </div>
    </section>
  )
}
