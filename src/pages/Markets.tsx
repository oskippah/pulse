import { useState } from 'react'
import { format } from 'date-fns'
import { LayoutList, LayoutGrid, RefreshCw } from 'lucide-react'
import { Header } from '../components/Header'
import { MarketBar } from '../components/MarketBar'
import { NewsCard } from '../components/NewsCard'
import { MatchCard } from '../components/MatchCard'
import { EmptyState, ErrorState, Spinner } from '../components/Spinner'
import { useNews } from '../hooks/useNews'
import { useMatches } from '../hooks/useMatches'
import type { Match, NewsArticle, NewsFilters } from '../types'

type CategoryKey = 'us' | 'europe' | 'etfs' | 'crypto' | 'bloomberg' | 'reuters' | 'all'

const CATEGORY_CHIPS: { key: CategoryKey; label: string; color: string; active: string }[] = [
  { key: 'all',       label: 'Alles',     color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-gray-800 dark:bg-white text-white dark:text-black' },
  { key: 'bloomberg', label: 'Bloomberg', color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-black dark:bg-white text-white dark:text-black' },
  { key: 'reuters',   label: 'Reuters',   color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-[#FF6B00] text-white' },
  { key: 'us',        label: 'US',        color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-blue-500 text-white' },
  { key: 'europe',    label: 'Europa',    color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-purple-500 text-white' },
  { key: 'etfs',      label: 'ETF',       color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-green-500 text-white' },
  { key: 'crypto',    label: 'Crypto',    color: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300', active: 'bg-orange-500 text-white' },
]

interface Props {
  filters: NewsFilters
  favoriteTeamIds: number[]
  onMatchClick: (match: Match) => void
}

export function Markets({ filters, favoriteTeamIds, onMatchClick }: Props) {
  const { articles, loading, error, lastUpdated, refresh } = useNews(filters)
  const { matches } = useMatches()
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [compact, setCompact] = useState(true)

  const anyEnabled =
    filters.us || filters.europe || filters.etfs || filters.crypto || filters.tickers.length > 0

  // Filter articles by active category chip
  const visibleArticles: NewsArticle[] = activeCategory === 'all'
    ? articles
    : articles.filter((a) => {
        if (activeCategory === 'bloomberg') return a.source === 'Bloomberg'
        if (activeCategory === 'reuters')   return a.source === 'Reuters'
        if (activeCategory === 'us')        return a.category === 'us' || a.category === 'ticker'
        if (activeCategory === 'europe')    return a.category === 'europe'
        if (activeCategory === 'etfs')      return a.category === 'etf'
        if (activeCategory === 'crypto')    return a.category === 'crypto'
        return true
      })

  // Favorite matches: live first, then soonest upcoming
  const favoriteMatches = matches
    .filter((m) =>
      favoriteTeamIds.includes(m.homeTeam.id) || favoriteTeamIds.includes(m.awayTeam.id)
    )
    .sort((a, b) => {
      const rank = (m: Match) =>
        m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 0
        : m.status === 'SCHEDULED' || m.status === 'TIMED' ? 1
        : 2
      return rank(a) - rank(b) || new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    })
    .slice(0, 3)

  const subtitle = lastUpdated ? `Updated ${format(lastUpdated, 'HH:mm')}` : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Markets"
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-1">
            <button onClick={() => setCompact((c) => !c)} className="text-gray-400 dark:text-zinc-500 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
              {compact ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
            </button>
            <button onClick={refresh} className="text-blue-500 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <RefreshCw size={18} />
            </button>
          </div>
        }
      />

      {/* Live prices + market status */}
      <MarketBar />

      {/* Category filter chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        {CATEGORY_CHIPS.map((chip) => {
          // Only show chips for enabled categories
          if (chip.key === 'bloomberg' && !filters.bloomberg) return null
          if (chip.key === 'reuters'   && !filters.reuters)   return null
          if (chip.key === 'us'        && !filters.us)        return null
          if (chip.key === 'europe'    && !filters.europe)    return null
          if (chip.key === 'etfs'      && !filters.etfs)      return null
          if (chip.key === 'crypto'    && !filters.crypto)    return null
          return (
            <button
              key={chip.key}
              onClick={() => setActiveCategory(chip.key)}
              className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors shrink-0 ${
                activeCategory === chip.key ? chip.active : chip.color
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth-ios mb-nav">

        {/* Favorite WK-matches */}
        {favoriteMatches.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide mb-2">★ Favoriete Teams</p>
            <div className="space-y-2">
              {favoriteMatches.map((m) => (
                <MatchCard key={m.id} match={m} onClick={onMatchClick} isFavorite compact />
              ))}
            </div>
          </div>
        )}

        {!anyEnabled && (
          <EmptyState message="Geen categorieën ingeschakeld. Ga naar Instellingen." />
        )}

        {loading && anyEnabled && <Spinner />}

        {!loading && error && (
          <ErrorState message={error} onRetry={refresh} />
        )}

        {!loading && !error && anyEnabled && visibleArticles.length === 0 && (
          <EmptyState message="Geen artikelen gevonden voor deze categorie." />
        )}

        {!loading && !error && visibleArticles.length > 0 && (
          compact ? (
            // Compact list mode
            <div className="px-4 py-2">
              {visibleArticles.map((a) => (
                <NewsCard key={a.id} article={a} compact />
              ))}
            </div>
          ) : (
            // Card mode
            <div className="px-4 py-3 space-y-3">
              {visibleArticles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
