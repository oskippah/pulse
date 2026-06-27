import { fetchWithCache } from './supabase'
import type { Match, MatchDetail, GroupStanding } from '../types'

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY as string
const BASE = 'https://api.football-data.org/v4'
const SEASON = '2026'
// The 2026 FIFA World Cup uses competition code 'WC' on football-data.org
const COMP = 'WC'

const headers = { 'X-Auth-Token': API_KEY }

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers })
  if (res.status === 429) throw new Error('Rate limit reached. Try again in a minute.')
  if (!res.ok) throw new Error(`Football API error ${res.status}: ${res.statusText}`)
  return res.json()
}

/** Fetch all WC 2026 matches, cached for 5 minutes. */
export async function fetchMatches(): Promise<Match[]> {
  const data = await fetchWithCache(
    `football:matches:${SEASON}`,
    () => get(`/competitions/${COMP}/matches?season=${SEASON}`),
    5 * 60 * 1000,
  ) as { matches: Match[] }
  return data.matches ?? []
}

/** Fetch group standings, cached for 10 minutes. */
export async function fetchStandings(): Promise<GroupStanding[]> {
  const data = await fetchWithCache(
    `football:standings:${SEASON}`,
    () => get(`/competitions/${COMP}/standings?season=${SEASON}`),
    10 * 60 * 1000,
  ) as { standings: GroupStanding[] }
  return data.standings ?? []
}

/**
 * Fetch match detail including lineups when available.
 * Line-up and stats data requires Tier 2+ on football-data.org.
 * We fetch it but gracefully return null fields if absent.
 */
export async function fetchMatchDetail(id: number): Promise<MatchDetail | null> {
  try {
    const data = await fetchWithCache(
      `football:match:${id}`,
      () => get(`/matches/${id}`),
      60 * 1000, // 1 minute for live matches
    )
    return data as MatchDetail
  } catch {
    return null
  }
}
