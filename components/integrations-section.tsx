"use client"

import { useState } from "react"
import useSWR from "swr"
import { CheckCircle2, ChevronDown, ExternalLink, Loader2, Plug, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GitHubIcon, SupabaseIcon, VercelIcon } from "@/components/brand-icons"
import type { ConnectionState, Provider } from "@/lib/connections"

type ProviderMeta = {
  id: Provider
  name: string
  icon: (props: { className?: string }) => React.ReactNode
  blurb: string
  tokenLabel: string
  help: string
  helpUrl: string
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: "github",
    name: "GitHub",
    icon: GitHubIcon,
    blurb: "Push generated projects to a repository with full commit history.",
    tokenLabel: "Personal access token",
    help: "Create a token with repo scope",
    helpUrl: "https://github.com/settings/tokens/new",
  },
  {
    id: "supabase",
    name: "Supabase",
    icon: SupabaseIcon,
    blurb: "Provision a Postgres database, auth, and storage for your app.",
    tokenLabel: "Access token",
    help: "Generate a Supabase access token",
    helpUrl: "https://supabase.com/dashboard/account/tokens",
  },
  {
    id: "vercel",
    name: "Vercel",
    icon: VercelIcon,
    blurb: "Deploy your build to a live production URL in seconds.",
    tokenLabel: "Access token",
    help: "Create a Vercel access token",
    helpUrl: "https://vercel.com/account/tokens",
  },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function IntegrationsSection() {
  const { data, mutate } = useSWR<Record<Provider, ConnectionState>>("/api/connections", fetcher)

  return (
    <section id="integrations" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Plug in your stack
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Connect the tools you already use. Tokens are verified against each provider&apos;s API and stored in a secure,
          http-only cookie for this session only.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PROVIDERS.map((provider) => (
          <IntegrationCard
            key={provider.id}
            meta={provider}
            state={data?.[provider.id]}
            onChange={() => mutate()}
          />
        ))}
      </div>
    </section>
  )
}

function IntegrationCard({
  meta,
  state,
  onChange,
}: {
  meta: ProviderMeta
  state?: ConnectionState
  onChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const Icon = meta.icon
  const connected = state?.connected

  async function connect() {
    if (!token.trim()) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/connections/${meta.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || "Could not connect.")
      setToken("")
      setOpen(false)
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect.")
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    setBusy(true)
    try {
      await fetch(`/api/connections/${meta.id}`, { method: "DELETE" })
      onChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Icon className="size-6" />
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            <CheckCircle2 className="size-3.5" /> Connected
          </span>
        ) : (
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
            Not connected
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-medium">{meta.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{meta.blurb}</p>

      {connected && state?.account ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {state.account.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.account.avatar || "/placeholder.svg"}
                alt=""
                className="size-8 rounded-full"
                crossOrigin="anonymous"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{state.account.name}</p>
              {state.account.detail && (
                <p className="truncate text-xs text-muted-foreground">{state.account.detail}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy} className="shrink-0">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            <span className="sr-only">Disconnect {meta.name}</span>
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span className="flex items-center gap-2">
              <Plug className="size-4" /> Connect {meta.name}
            </span>
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>

          {open && (
            <div className="mt-3 space-y-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor={`token-${meta.id}`}>
                {meta.tokenLabel}
              </label>
              <input
                id={`token-${meta.id}`}
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) connect()
                }}
                placeholder="Paste your token"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={meta.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {meta.help} <ExternalLink className="size-3" />
                </a>
                <Button size="sm" onClick={connect} disabled={busy || !token.trim()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Verify & connect"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
