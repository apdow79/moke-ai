import { streamText } from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export const maxDuration = 60

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Free models share a rate-limited upstream pool, so we try several in order
// and fall back to the next one whenever a provider is overloaded (429).
const MODEL_IDS = [
  "z-ai/glm-5.2:free",
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
]

export const ERROR_MARKER = "\u0000FOUNDRY_ERROR\u0000"

const SYSTEM_PROMPT = `You are Foundry, an expert front-end engineer that generates complete, production-quality websites and apps as a SINGLE self-contained HTML file.

Rules:
- Output ONLY raw HTML. No markdown, no code fences, no commentary before or after.
- The document must be a full HTML5 file starting with <!DOCTYPE html>.
- Include all CSS in a single <style> tag and all JS in <script> tags. Do not reference external files.
- You may use Tailwind via <script src="https://cdn.tailwindcss.com"></script> and Google Fonts via <link>.
- Use tasteful, modern design: strong typography, real spacing, a coherent color palette, responsive layout, and subtle interactivity.
- Use https://images.unsplash.com or https://picsum.photos for images when needed.
- Make it genuinely functional — real interactions, not placeholders — matching the user's request.`

export async function POST(req: Request) {
  const { prompt } = await req.json()

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return new Response("A prompt is required.", { status: 400 })
  }

  const encoder = new TextEncoder()

  function friendly(raw: string) {
    if (/rate-limit|overloaded|429|temporarily/i.test(raw)) {
      return "All free models are busy right now (they share a rate-limited pool). Please try again in a few seconds."
    }
    if (/credit card|verification_required|unlock your free credits/i.test(raw)) {
      return "The provider needs billing enabled before it can generate. Add a payment method, then try again."
    }
    if (/api key|no auth|unauthor|401/i.test(raw)) {
      return "The OpenRouter API key is missing or invalid. Add a valid OPENROUTER_API_KEY and try again."
    }
    return `Generation failed: ${raw}`
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastError = "No models were available."

      for (const modelId of MODEL_IDS) {
        const result = streamText({
          model: openrouter(modelId),
          system: SYSTEM_PROMPT,
          prompt: `Build this: ${prompt.trim()}`,
          temperature: 0.7,
        })

        let emittedText = false
        try {
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              emittedText = true
              controller.enqueue(encoder.encode(part.text))
            } else if (part.type === "error") {
              lastError = part.error instanceof Error ? part.error.message : String(part.error)
              break
            }
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error)
        }

        // Text streamed successfully from this model — we're done.
        if (emittedText) {
          controller.close()
          return
        }
        // Otherwise the model failed before producing output; try the next one.
      }

      // Every model failed before producing any output.
      controller.enqueue(encoder.encode(`${ERROR_MARKER}${friendly(lastError)}`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
