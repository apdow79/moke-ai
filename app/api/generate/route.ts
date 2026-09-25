import { streamText } from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export const maxDuration = 60

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODEL_ID = "z-ai/glm-5.2:free"

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

  const result = streamText({
    model: openrouter(MODEL_ID),
    system: SYSTEM_PROMPT,
    prompt: `Build this: ${prompt.trim()}`,
    temperature: 0.7,
  })

  const encoder = new TextEncoder()

  function friendly(raw: string) {
    return /credit card|verification_required|unlock your free credits/i.test(raw)
      ? "The AI Gateway needs billing enabled before it can generate. Add a payment method to your Vercel team to unlock the free credits, then try again."
      : `Generation failed: ${raw}`
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(part.text))
          } else if (part.type === "error") {
            const raw = part.error instanceof Error ? part.error.message : String(part.error)
            controller.enqueue(encoder.encode(`${ERROR_MARKER}${friendly(raw)}`))
          }
        }
      } catch (error) {
        const raw = error instanceof Error ? error.message : String(error)
        controller.enqueue(encoder.encode(`${ERROR_MARKER}${friendly(raw)}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
