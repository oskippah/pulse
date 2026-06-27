import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { MatchCard } from '../components/MatchCard'
import { NewsCard } from '../components/NewsCard'
import { EmptyState } from '../components/Spinner'
import { useNews } from '../hooks/useNews'
import { useMatches } from '../hooks/useMatches'
import type { Match, NewsFilters } from '../types'

interface Props {
  filters: NewsFilters
  onMatchSelect: (match: Match) => void
}

export function Search({ filters, onMatchSelect }: Props) {
  const [query, setQuery] = useState('')
  const { articles } = useNews(filters)
  const { matches } = useMatches()

  const q = query.trim().toLowerCase()

  const filteredArticles = useMemo(() => {
    if (!q) return []
    return articles.filter(
      (a) =>
        a.headline.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.related?.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [articles, q])

  const filteredMatches = useMemo(() => {
    if (!q) return []
    return matches.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.tla.toLowerCase().includes(q) ||
        m.awayTeam.tla.toLowerCase().includes(q) ||
        m.homeTeam.shortName?.toLowerCase().includes(q) ||
        m.awayTeam.shortName?.toLowerCase().includes(q)
    )
  }, [matches, q])

  const hasResults = filteredArticles.length > 0 || filteredMatches.length > 0

  return (
    <div className="flex flex-col h-full">
      <Header title="Search" />

      {/* Search input */}
      <div className="px-4 py-3 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search"
            placeholder="Teams, news, tickers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-zinc-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/40 transition"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24">
        {!q && (
          <EmptyState message="Start typing to search news headlines and World Cup teams." />
        )}

        {q && !hasResults && (
          <EmptyState message={`No results for "${query}"`} />
        )}

        {filteredMatches.length > 0 && (
          <div className="px-4 pt-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              Matches
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {filteredMatches.map((m) => (
                <MatchCard key={m.id} match={m} onClick={onMatchSelect} />
              ))}
            </div>
          </div>
        )}

        {filteredArticles.length > 0 && (
          <div className="px-4 pt-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              News
            </p>
            <div className="flex flex-col gap-3">
              {filteredArticles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
