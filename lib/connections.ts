export type Provider = "github" | "supabase" | "vercel"

export type Account = {
  name: string
  detail?: string
  avatar?: string
}

export type ConnectionState = {
  connected: boolean
  account?: Account
  connectedAt?: string
}

export const PROVIDERS: Provider[] = ["github", "supabase", "vercel"]

export function isProvider(value: string): value is Provider {
  return (PROVIDERS as string[]).includes(value)
}

export function tokenCookie(provider: Provider) {
  return `foundry_tok_${provider}`
}

export function accountCookie(provider: Provider) {
  return `foundry_acct_${provider}`
}

/**
 * Verify a token against each provider's real API and return the account
 * details on success. Throws with a human-readable message on failure.
 */
export async function verifyToken(provider: Provider, token: string): Promise<Account> {
  switch (provider) {
    case "github": {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "foundry-ai",
        },
      })
      if (!res.ok) throw new Error("Invalid GitHub token or insufficient scopes.")
      const user = await res.json()
      return {
        name: user.login,
        detail: user.name || user.html_url,
        avatar: user.avatar_url,
      }
    }
    case "vercel": {
      const res = await fetch("https://api.vercel.com/v2/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Invalid Vercel token.")
      const data = await res.json()
      const user = data.user ?? data
      return {
        name: user.username || user.name || "Vercel account",
        detail: user.email,
      }
    }
    case "supabase": {
      // Uses a Supabase personal access token against the Management API.
      const res = await fetch("https://api.supabase.com/v1/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Invalid Supabase access token.")
      const projects = (await res.json()) as Array<{ name: string; id: string }>
      const count = Array.isArray(projects) ? projects.length : 0
      return {
        name: "Supabase account",
        detail: `${count} project${count === 1 ? "" : "s"} available`,
      }
    }
  }
}
