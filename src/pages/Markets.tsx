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

const CHIPS: { key: CategoryKey; label: string; color: string }[] = [
  { key: 'all',       label: 'Alles',     color: 'var(--c-text)' },
  { key: 'bloomberg', label: 'Bloomberg', color: 'var(--c-text)' },
  { key: 'reuters',   label: 'Reuters',   color: 'var(--c-orange)' },
  { key: 'us',        label: 'US',        color: 'var(--c-accent)' },
  { key: 'europe',    label: 'Europa',    color: 'var(--c-purple)' },
  { key: 'etfs',      label: 'ETF',       color: 'var(--c-green)' },
  { key: 'crypto',    label: 'Crypto',    color: 'var(--c-orange)' },
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
    filters.us || filters.europe || filters.etfs || filters.crypto ||
    filters.tickers.length > 0 || filters.bloomberg || filters.reuters

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

  const favoriteMatches = matches
    .filter((m) => favoriteTeamIds.includes(m.homeTeam.id) || favoriteTeamIds.includes(m.awayTeam.id))
    .sort((a, b) => {
      const rank = (m: Match) =>
        m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 0
        : m.status === 'SCHEDULED' || m.status === 'TIMED' ? 1 : 2
      return rank(a) - rank(b) || new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    })
    .slice(0, 3)

  const subtitle = lastUpdated ? `Bijgewerkt ${format(lastUpdated, 'HH:mm')}` : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Markets"
        subtitle={subtitle}
        right={
          <div className="flex items-center">
            <button
              onClick={() => setCompact((c) => !c)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--c-text3)' }}
            >
              {compact ? <LayoutGrid size={20} /> : <LayoutList size={20} />}
            </button>
            <button
              onClick={refresh}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--c-accent)' }}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        }
      />

      <MarketBar />

      {/* Category chips */}
      <div
        className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none"
        style={{ background: 'var(--c-surface)', borderBottom: '0.5px solid var(--c-sep)' }}
      >
        {CHIPS.map((chip) => {
          if (chip.key === 'bloomberg' && !filters.bloomberg) return null
          if (chip.key === 'reuters'   && !filters.reuters)   return null
          if (chip.key === 'us'        && !filters.us)        return null
          if (chip.key === 'europe'    && !filters.europe)    return null
          if (chip.key === 'etfs'      && !filters.etfs)      return null
          if (chip.key === 'crypto'    && !filters.crypto)    return null
          const isActive = activeCategory === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => setActiveCategory(chip.key)}
              className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all min-h-[36px]"
              style={{
                background: isActive ? chip.color : 'var(--c-surface2)',
                color: isActive ? '#fff' : 'var(--c-text2)',
                border: `1px solid ${isActive ? chip.color : 'var(--c-sep)'}`,
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 scroll-ios mb-nav">
        {/* Favorite matches */}
        {favoriteMatches.length > 0 && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--c-yellow)' }}>
              ★ Favoriete teams
            </p>
            <div className="space-y-2">
              {favoriteMatches.map((m) => (
                <MatchCard key={m.id} match={m} onClick={onMatchClick} isFavorite compact />
              ))}
            </div>
          </div>
        )}

        {!anyEnabled && <EmptyState icon="⚙️" message="Geen categorieën ingeschakeld. Ga naar Instellingen." />}
        {loading && anyEnabled && <Spinner />}
        {!loading && error && <ErrorState message={error} onRetry={refresh} />}
        {!loading && !error && anyEnabled && visibleArticles.length === 0 && (
          <EmptyState icon="📭" message="Geen artikelen gevonden voor deze categorie." />
        )}

        {!loading && !error && visibleArticles.length > 0 && (
          compact ? (
            <div className="px-4 py-2">
              {visibleArticles.map((a) => <NewsCard key={a.id} article={a} compact />)}
            </div>
          ) : (
            <div className="px-4 py-3 space-y-3">
              {visibleArticles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
