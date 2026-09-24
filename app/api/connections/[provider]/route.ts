import { cookies } from "next/headers"
import { accountCookie, isProvider, tokenCookie, verifyToken } from "@/lib/connections"

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
}

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  if (!isProvider(provider)) {
    return Response.json({ error: "Unknown provider." }, { status: 404 })
  }

  let token: string | undefined
  try {
    const body = await req.json()
    token = body?.token
  } catch {
    // handled below
  }

  if (!token || typeof token !== "string") {
    return Response.json({ error: "A token is required." }, { status: 400 })
  }

  try {
    const account = await verifyToken(provider, token.trim())
    const store = await cookies()
    const payload = JSON.stringify({ account, connectedAt: new Date().toISOString() })
    store.set(tokenCookie(provider), token.trim(), COOKIE_OPTS)
    store.set(accountCookie(provider), payload, { ...COOKIE_OPTS, httpOnly: false })
    return Response.json({ connected: true, account })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify token."
    return Response.json({ error: message }, { status: 401 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  if (!isProvider(provider)) {
    return Response.json({ error: "Unknown provider." }, { status: 404 })
  }
  const store = await cookies()
  store.delete(tokenCookie(provider))
  store.delete(accountCookie(provider))
  return Response.json({ connected: false })
}
