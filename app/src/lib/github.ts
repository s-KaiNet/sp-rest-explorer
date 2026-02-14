const CACHE_KEY = 'sp-explorer-gh-stars'
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

interface StarCache {
  count: number
  fetchedAt: number
}

function getCached(): StarCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: StarCache = JSON.parse(raw)
    if (typeof parsed.count !== 'number' || typeof parsed.fetchedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function setCache(count: number): void {
  const entry: StarCache = { count, fetchedAt: Date.now() }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export async function fetchStarCount(repo: string): Promise<number | null> {
  const cached = getCached()

  // Return cached value if still fresh
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.count
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`)
    if (!res.ok) {
      return cached?.count ?? null
    }
    const data = await res.json()
    const count = data.stargazers_count
    if (typeof count !== 'number') {
      return cached?.count ?? null
    }
    setCache(count)
    return count
  } catch {
    // Network error or rate limit — fall back to cached value
    return cached?.count ?? null
  }
}

export function formatStarCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  return String(count)
}
