import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchNews } from '../lib/finnhub'
import type { NewsArticle, NewsFilters } from '../types'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useNews(filters: NewsFilters) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const anyEnabled =
      filters.us || filters.europe || filters.etfs || filters.crypto || filters.tickers.length > 0

    if (!anyEnabled) {
      setArticles([])
      setLoading(false)
      return
    }

    setError(null)
    try {
      const data = await fetchNews(filters)
      setArticles(data)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // eslint-disable-line

  useEffect(() => {
    setLoading(true)
    load()
    timerRef.current = setInterval(load, REFRESH_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [load])

  return { articles, loading, error, lastUpdated, refresh: load }
}
