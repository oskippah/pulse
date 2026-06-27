import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMatchDetail, fetchMatches, fetchStandings } from '../lib/football'
import type { GroupStanding, Match, MatchDetail } from '../types'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hasLive = matches.some((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  const interval = hasLive ? 60_000 : 5 * 60_000

  const load = useCallback(async () => {
    setError(null)
    try {
      const [m, s] = await Promise.all([fetchMatches(), fetchStandings()])
      setMatches(m)
      setStandings(s)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load match data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, interval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [load, interval])

  return { matches, standings, loading, error, lastUpdated, refresh: load }
}

export function useMatchDetail(id: number | null) {
  const [detail, setDetail] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchMatchDetail(id).then((d) => {
      setDetail(d)
      setLoading(false)
    })
  }, [id])

  return { detail, loading }
}
