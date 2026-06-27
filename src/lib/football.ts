import { fetchWithCache } from './supabase'
import type { Match, MatchDetail, GroupStanding } from '../types'

const SEASON = '2026'

// In production: calls go through our Vercel proxy (no CORS issues, key stays server-side)
// In dev: calls go directly to the API via the proxy at /api/football
async function get(path: string) {
  const res = await fetch(`/api/football?path=${encodeURIComponent(path)}`)
  if (res.status === 429) throw new Error('Rate limit reached. Try again in a minute.')
  if (!res.ok) throw new Error(`Football API error ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function fetchMatches(): Promise<Match[]> {
  const data = await fetchWithCache(
    `football:matches:${SEASON}`,
    () => get(`/competitions/WC/matches?season=${SEASON}`),
    5 * 60 * 1000,
  ) as { matches: Match[] }
  return data.matches ?? []
}

export async function fetchStandings(): Promise<GroupStanding[]> {
  const data = await fetchWithCache(
    `football:standings:${SEASON}`,
    () => get(`/competitions/WC/standings?season=${SEASON}`),
    10 * 60 * 1000,
  ) as { standings: GroupStanding[] }
  return data.standings ?? []
}

export async function fetchMatchDetail(id: number): Promise<MatchDetail | null> {
  try {
    const data = await fetchWithCache(
      `football:match:${id}`,
      () => get(`/matches/${id}`),
      60 * 1000,
    )
    return data as MatchDetail
  } catch {
    return null
  }
}
