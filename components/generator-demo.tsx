"use client"

import { useRef, useState } from "react"
import { ArrowUp, Code2, Eye, Loader2, Monitor, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const ERROR_MARKER = "\u0000FOUNDRY_ERROR\u0000"

const EXAMPLES = [
  "A SaaS landing page for an AI note-taking app",
  "A pricing page with 3 tiers and a toggle",
  "A personal portfolio for a product designer",
  "A todo app with add, complete, and filter",
]

type Tab = "preview" | "code"

export function GeneratorDemo() {
  const [prompt, setPrompt] = useState("")
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [tab, setTab] = useState<Tab>("preview")
  const abortRef = useRef<AbortController | null>(null)

  async function run(value: string) {
    const text = value.trim()
    if (!text || status === "streaming") return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus("streaming")
    setErrorMsg("")
    setCode("")
    setTab("preview")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "")
        throw new Error(msg || "Generation failed. Please try again.")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { done, value: chunk } = await reader.read()
        if (done) break
        acc += decoder.decode(chunk, { stream: true })

        const markerIndex = acc.indexOf(ERROR_MARKER)
        if (markerIndex !== -1) {
          throw new Error(acc.slice(markerIndex + ERROR_MARKER.length).trim() || "Generation failed.")
        }
        setCode(acc)
      }

      if (acc.trim().length === 0) {
        throw new Error("The model returned an empty response. Please try again.")
      }
      setStatus("done")
    } catch (err) {
      if (controller.signal.aborted) return
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      run(prompt)
    }
  }

  const previewDoc = cleanHtml(code)
  const hasOutput = code.length > 0 || status === "streaming"

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Prompt bar */}
      <div className="rounded-2xl border border-border bg-card/70 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
        <div className="flex flex-col gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Describe the website or app you want to build..."
            rows={2}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘</kbd>{" "}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to generate
            </span>
            <Button
              onClick={() => run(prompt)}
              disabled={status === "streaming" || prompt.trim().length === 0}
              className="ml-auto gap-1.5"
            >
              {status === "streaming" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating
                </>
              ) : (
                <>
                  Generate <ArrowUp className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Example chips */}
      {!hasOutput && status !== "error" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setPrompt(ex)
                run(ex)
              }}
              className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          <span>{errorMsg}</span>
          <Button variant="outline" size="sm" onClick={() => run(prompt)} className="gap-1.5">
            <RotateCcw className="size-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Output panel */}
      {hasOutput && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-destructive/60" />
              <span className="size-3 rounded-full bg-chart-4/60" />
              <span className="size-3 rounded-full bg-accent/60" />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-background/60 p-0.5">
              <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={<Eye className="size-3.5" />}>
                Preview
              </TabButton>
              <TabButton active={tab === "code"} onClick={() => setTab("code")} icon={<Code2 className="size-3.5" />}>
                Code
              </TabButton>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {status === "streaming" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" /> Building
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Monitor className="size-3.5" /> Live
                </span>
              )}
            </div>
          </div>

          {tab === "preview" ? (
            <div className="relative aspect-[4/3] w-full bg-white sm:aspect-video">
              {previewDoc ? (
                <iframe
                  title="Generated preview"
                  srcDoc={previewDoc}
                  sandbox="allow-scripts"
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  Waiting for the first lines of markup...
                </div>
              )}
            </div>
          ) : (
            <pre className="max-h-[60vh] overflow-auto bg-background p-4 text-xs leading-relaxed">
              <code className="font-mono text-muted-foreground">{code || "// generating..."}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

/**
 * The model streams raw HTML but can occasionally wrap it in markdown fences.
 * Strip them so the iframe always receives a clean document.
 */
function cleanHtml(raw: string) {
  if (!raw) return ""
  let out = raw.trim()
  if (out.startsWith("```")) {
    out = out.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "")
  }
  return out
}
