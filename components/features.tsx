import { Boxes, GitBranch, Gauge, Layers, ShieldCheck, Wand2 } from "lucide-react"

const FEATURES = [
  {
    icon: Wand2,
    title: "Prompt to product",
    body: "Describe what you want in plain English and get a complete, responsive build — layout, styles, and interactivity included.",
  },
  {
    icon: Layers,
    title: "Real, editable code",
    body: "Every generation is clean, readable code you fully own. No lock-in, no black boxes, export anytime.",
  },
  {
    icon: Boxes,
    title: "Full-stack ready",
    body: "Generate marketing pages, dashboards, and app UIs, then connect a database and auth in a couple of clicks.",
  },
  {
    icon: GitBranch,
    title: "Git-native",
    body: "Connect GitHub and push generated projects straight to a repository with branches and history.",
  },
  {
    icon: Gauge,
    title: "Instant deploys",
    body: "Link Vercel to ship your build to a live URL the moment it is ready.",
  },
  {
    icon: ShieldCheck,
    title: "Free models",
    body: "Powered by fast, capable models through a single gateway. Start building with zero setup.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need between idea and production
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Foundry handles the full loop — generate, refine, version, and deploy — without leaving the page.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
              <Icon className="size-5" />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
