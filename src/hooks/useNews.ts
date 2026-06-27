import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchNews } from '../lib/finnhub'
import { fetchRSSFeeds } from '../lib/rss'
import type { NewsArticle, NewsFilters } from '../types'

const REFRESH_INTERVAL = 5 * 60 * 1000

export function useNews(filters: NewsFilters) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const anyEnabled =
      filters.us || filters.europe || filters.etfs || filters.crypto ||
      filters.tickers.length > 0 || filters.bloomberg || filters.reuters

    if (!anyEnabled) {
      setArticles([])
      setLoading(false)
      return
    }

    setError(null)
    try {
      // Fetch Finnhub + RSS in parallel
      const [finnhubArticles, rssArticles] = await Promise.allSettled([
        fetchNews(filters),
        fetchRSSFeeds(filters.bloomberg ?? false, filters.reuters ?? false),
      ])

      const all = [
        ...(finnhubArticles.status === 'fulfilled' ? finnhubArticles.value : []),
        ...(rssArticles.status === 'fulfilled' ? rssArticles.value : []),
      ]

      // Deduplicate by id, sort newest first
      const seen = new Set<string>()
      const deduped = all
        .filter((a) => { if (seen.has(a.id)) return false; seen.add(a.id); return true })
        .sort((a, b) => b.datetime - a.datetime)

      setArticles(deduped)
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
