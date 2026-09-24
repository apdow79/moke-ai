import { cookies } from "next/headers"
import { PROVIDERS, accountCookie, type ConnectionState, type Provider } from "@/lib/connections"

export async function GET() {
  const store = await cookies()
  const result: Record<Provider, ConnectionState> = {} as Record<Provider, ConnectionState>

  for (const provider of PROVIDERS) {
    const raw = store.get(accountCookie(provider))?.value
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        result[provider] = { connected: true, account: parsed.account, connectedAt: parsed.connectedAt }
        continue
      } catch {
        // fall through to disconnected
      }
    }
    result[provider] = { connected: false }
  }

  return Response.json(result)
}
